import migrationsBundle from '@pennyspring/data/drizzle/migrations';

const MIGRATIONS_TABLE = '__drizzle_migrations';
const STATEMENT_BREAKPOINT = '--> statement-breakpoint';
const MIGRATIONS_TABLE_DDL = `CREATE TABLE IF NOT EXISTS "${MIGRATIONS_TABLE}" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)`;
const LAST_APPLIED_AT_SQL = `SELECT created_at FROM "${MIGRATIONS_TABLE}" ORDER BY created_at DESC LIMIT 1`;
const INSERT_MIGRATION_SQL = `INSERT INTO "${MIGRATIONS_TABLE}" ("hash", "created_at") VALUES (?, ?)`;

const DUPLICATE_OBJECT_MESSAGE = /already exists|duplicate column name/i;
const CREATE_TABLE =
  /^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"[]?([A-Za-z0-9_]+)/i;
const CREATE_INDEX =
  /^CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"[]?([A-Za-z0-9_]+)/i;
const ALTER_TABLE_ADD =
  /^ALTER\s+TABLE\s+[`"[]?([A-Za-z0-9_]+)[`"\]]?\s+ADD\s+(?:COLUMN\s+)?[`"[]?([A-Za-z0-9_]+)/i;

/** 迁移语句可绑定的参数；打包迁移只用字符串与数字。 */
export type MigrationParam = string | number | null;

/** 迁移执行所需的最小查询结果。 */
export interface MigrationQueryResult {
  rows: Array<Record<string, unknown>>;
}

/** 迁移执行所需的最小事务接口，生产环境由 op-sqlite transaction 提供。 */
export interface MigrationTransaction {
  execute(
    query: string,
    params?: MigrationParam[],
  ): Promise<MigrationQueryResult>;
}

/** 迁移执行所需的最小连接接口。 */
export interface MigrationConnection extends MigrationTransaction {
  transaction(run: (tx: MigrationTransaction) => Promise<void>): Promise<void>;
}

interface BundledMigration {
  statements: string[];
  createdAt: number;
}

interface ExistingObjectTarget {
  kind: 'table' | 'index' | 'column';
  table?: string;
  name: string;
}

const bundle = migrationsBundle as unknown as {
  journal: { entries: Array<{ idx: number; when: number; tag: string }> };
  migrations: Record<string, string>;
};

function readBundledMigrations(): BundledMigration[] {
  return bundle.journal.entries.map(entry => {
    const key = `m${String(entry.idx).padStart(4, '0')}`;
    const sql = bundle.migrations[key];
    if (!sql) {
      throw new Error(`Missing migration: ${entry.tag}`);
    }
    return {
      createdAt: entry.when,
      statements: sql
        .split(STATEMENT_BREAKPOINT)
        .map(statement => statement.trim())
        .filter(Boolean),
    };
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isDuplicateObjectError(error: unknown): boolean {
  return DUPLICATE_OBJECT_MESSAGE.test(getErrorMessage(error));
}

/**
 * 解析语句操作的对象，供重复对象错误时校验其是否真实存在。
 * 只识别迁移里会出现的 DDL；其他语句返回 null，错误照常抛出。
 */
function resolveExistingObjectTarget(
  statement: string,
): ExistingObjectTarget | null {
  const createTable = CREATE_TABLE.exec(statement);
  if (createTable) {
    return { kind: 'table', name: createTable[1] };
  }
  const createIndex = CREATE_INDEX.exec(statement);
  if (createIndex) {
    return { kind: 'index', name: createIndex[1] };
  }
  const alterTableAdd = ALTER_TABLE_ADD.exec(statement);
  if (alterTableAdd) {
    return { kind: 'column', table: alterTableAdd[1], name: alterTableAdd[2] };
  }
  return null;
}

async function objectExists(
  tx: MigrationTransaction,
  target: ExistingObjectTarget,
): Promise<boolean> {
  if (target.kind === 'column') {
    const result = await tx.execute(
      'SELECT name FROM pragma_table_info(?) WHERE name = ?',
      [target.table ?? '', target.name],
    );
    return result.rows.length > 0;
  }
  const result = await tx.execute(
    'SELECT name FROM sqlite_master WHERE type = ? AND name = ?',
    [target.kind, target.name],
  );
  return result.rows.length > 0;
}

async function recordMigration(
  tx: MigrationTransaction,
  migration: BundledMigration,
): Promise<void> {
  await tx.execute(INSERT_MIGRATION_SQL, ['', migration.createdAt]);
}

async function applyMigration(
  connection: MigrationConnection,
  migration: BundledMigration,
): Promise<void> {
  try {
    await connection.transaction(async tx => {
      for (const statement of migration.statements) {
        await tx.execute(statement);
      }
      await recordMigration(tx, migration);
    });
  } catch (error) {
    if (!isDuplicateObjectError(error)) {
      throw error;
    }
    await connection.transaction(async tx => {
      for (const statement of migration.statements) {
        try {
          await tx.execute(statement);
        } catch (statementError) {
          const target = resolveExistingObjectTarget(statement);
          if (
            !isDuplicateObjectError(statementError) ||
            !target ||
            !(await objectExists(tx, target))
          ) {
            throw statementError;
          }
        }
      }
      await recordMigration(tx, migration);
    });
  }
}

async function readLastAppliedAt(
  connection: MigrationConnection,
): Promise<number | null> {
  const result = await connection.execute(LAST_APPLIED_AT_SQL);
  const row = result.rows[0];
  if (!row) {
    return null;
  }
  const createdAt = Number(row.created_at);
  return Number.isFinite(createdAt) ? createdAt : null;
}

/**
 * 执行 `@pennyspring/data/drizzle/migrations` 中打包的迁移。
 *
 * 每个迁移在独立事务内执行并写入迁移记录，避免中断留下半应用状态
 * （drizzle-orm 0.45.x 的 op-sqlite 迁移器不会等待事务提交）。
 * 对旧版本留下的半应用状态，重复建表/建索引/加列错误会校验对象确实存在后跳过，
 * 使升级中断的用户无需重装即可继续使用。
 */
export async function runMigrations(
  connection: MigrationConnection,
): Promise<void> {
  await connection.execute(MIGRATIONS_TABLE_DDL);
  const lastAppliedAt = await readLastAppliedAt(connection);
  const pending = readBundledMigrations().filter(
    migration => lastAppliedAt === null || migration.createdAt > lastAppliedAt,
  );
  for (const migration of pending) {
    await applyMigration(connection, migration);
  }
}
