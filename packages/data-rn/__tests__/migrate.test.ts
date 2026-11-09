import Database from 'better-sqlite3';

import migrationsBundle from '@pennyspring/data/drizzle/migrations';

import { runMigrations } from '../src/adapter-op-sqlite/migrate';
import { createFakeOpSqliteConnection } from '../test-utils/fakeOpSqliteConnection';

type Sqlite = InstanceType<typeof Database>;

const bundle = migrationsBundle as unknown as {
  journal: { entries: Array<{ idx: number; when: number; tag: string }> };
  migrations: Record<string, string>;
};

const ENTRIES = bundle.journal.entries;
const BREAKPOINT = '--> statement-breakpoint';

function statementsOf(entryIdx: number): string[] {
  const key = `m${String(entryIdx).padStart(4, '0')}`;
  return bundle.migrations[key]
    .split(BREAKPOINT)
    .map(statement => statement.trim())
    .filter(Boolean);
}

function ensureMigrationsTable(db: Sqlite): void {
  db.exec(
    'CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)',
  );
}

function recordTimestamp(db: Sqlite, entryIdx: number): void {
  db.prepare(
    'INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES (?, ?)',
  ).run('', ENTRIES[entryIdx].when);
}

/** 构造旧版本数据库：完整应用前 appliedCount 个迁移并写入记录。 */
function prepareLegacyDatabase(db: Sqlite, appliedCount: number): void {
  ensureMigrationsTable(db);
  for (let idx = 0; idx < appliedCount; idx += 1) {
    for (const statement of statementsOf(idx)) {
      db.exec(statement);
    }
    recordTimestamp(db, idx);
  }
}

function tableNames(db: Sqlite): string[] {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map(row => String((row as { name: unknown }).name));
}

function indexNames(db: Sqlite): string[] {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'index'")
    .all()
    .map(row => String((row as { name: unknown }).name));
}

function columnNames(db: Sqlite, table: string): string[] {
  return db
    .prepare(`SELECT name FROM pragma_table_info('${table}')`)
    .all()
    .map(row => String((row as { name: unknown }).name));
}

function recordedTimestamps(db: Sqlite): number[] {
  return db
    .prepare(
      'SELECT created_at FROM "__drizzle_migrations" ORDER BY created_at',
    )
    .all()
    .map(row => Number((row as { created_at: unknown }).created_at));
}

describe('runMigrations', () => {
  it('applies every bundled migration on an empty database', async () => {
    const db = new Database(':memory:');

    await runMigrations(createFakeOpSqliteConnection(db));

    expect(tableNames(db)).toEqual(
      expect.arrayContaining([
        'tb_books',
        'tb_quick_book_draft',
        'tb_agent_rules',
        'tb_record_client_mutation',
      ]),
    );
    expect(columnNames(db, 'tb_quick_book_draft')).toContain('attach_image');
    expect(recordedTimestamps(db)).toHaveLength(ENTRIES.length);
  });

  it('does not re-apply migrations when the schema is already up to date', async () => {
    const db = new Database(':memory:');
    await runMigrations(createFakeOpSqliteConnection(db));
    const timestamps = recordedTimestamps(db);

    await expect(
      runMigrations(createFakeOpSqliteConnection(db)),
    ).resolves.toBeUndefined();

    expect(recordedTimestamps(db)).toEqual(timestamps);
  });

  it('recovers when a previous upgrade created the draft table without recording the migration', async () => {
    const db = new Database(':memory:');
    prepareLegacyDatabase(db, 2);
    // 复现线上损坏态：0002 的 CREATE TABLE 已落库，但迁移记录未写入
    db.exec(statementsOf(2)[0]);

    await expect(
      runMigrations(createFakeOpSqliteConnection(db)),
    ).resolves.toBeUndefined();

    expect(tableNames(db)).toContain('tb_quick_book_draft');
    expect(columnNames(db, 'tb_quick_book_draft')).toContain('attach_image');
    expect(indexNames(db)).toEqual(
      expect.arrayContaining([
        'tb_quick_book_draft_status_updated_time_index',
        'tb_quick_book_draft_books_id_status_index',
      ]),
    );
    expect(recordedTimestamps(db)).toHaveLength(ENTRIES.length);
  });

  it('recovers when a previous upgrade added the column without recording the migration', async () => {
    const db = new Database(':memory:');
    prepareLegacyDatabase(db, 3);
    // 0003 的 ALTER TABLE 已执行，但迁移记录未写入
    db.exec(statementsOf(3)[0]);

    await expect(
      runMigrations(createFakeOpSqliteConnection(db)),
    ).resolves.toBeUndefined();

    expect(
      columnNames(db, 'tb_quick_book_draft').filter(
        column => column === 'attach_image',
      ),
    ).toHaveLength(1);
    expect(recordedTimestamps(db)).toHaveLength(ENTRIES.length);
  });

  it('rolls back a migration that fails midway and keeps earlier migrations recorded', async () => {
    const db = new Database(':memory:');
    const failingStatement = statementsOf(4)[1];
    const connection = createFakeOpSqliteConnection(db, sql =>
      sql === failingStatement ? new Error('disk I/O error') : undefined,
    );

    await expect(runMigrations(connection)).rejects.toThrow('disk I/O error');

    expect(tableNames(db)).not.toContain('tb_agent_rules');
    expect(tableNames(db)).not.toContain('tb_record_client_mutation');
    expect(recordedTimestamps(db)).toHaveLength(4);
  });

  it('does not swallow duplicate object errors when the object does not exist', async () => {
    const db = new Database(':memory:');
    const failingStatement = statementsOf(4)[0];
    const connection = createFakeOpSqliteConnection(db, sql =>
      sql === failingStatement
        ? new Error('table `tb_agent_rules` already exists')
        : undefined,
    );

    await expect(runMigrations(connection)).rejects.toThrow('already exists');

    expect(tableNames(db)).not.toContain('tb_agent_rules');
    expect(recordedTimestamps(db)).toHaveLength(4);
  });
});
