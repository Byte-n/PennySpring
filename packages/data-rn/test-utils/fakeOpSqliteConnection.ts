import Database from 'better-sqlite3';

import type {
  MigrationConnection,
  MigrationParam,
  MigrationTransaction,
} from '../src/adapter-op-sqlite/migrate';

export type Sqlite = InstanceType<typeof Database>;

export type ExecuteInterceptor = (sql: string) => Error | undefined;

export interface FakeQueryResult {
  rows: Array<Record<string, unknown>>;
  rowsAffected: number;
}

/**
 * 测试用的 op-sqlite 连接替身：
 * 用 better-sqlite3 承载真实 SQL，模拟 op-sqlite 的异步执行与事务语义。
 */
export interface FakeOpSqliteConnection extends MigrationConnection {
  executeAsync(
    query: string,
    params?: MigrationParam[],
  ): Promise<FakeQueryResult>;
  executeRawAsync(
    query: string,
    params?: MigrationParam[],
  ): Promise<unknown[][]>;
}

function executeSql(
  sqlite: Sqlite,
  sql: string,
  params: MigrationParam[] = [],
): FakeQueryResult {
  const statement = sqlite.prepare(sql);
  if (statement.reader) {
    return {
      rows: statement.all(...params) as Array<Record<string, unknown>>,
      rowsAffected: 0,
    };
  }
  const info = statement.run(...params);
  return { rows: [], rowsAffected: info.changes };
}

export function createFakeOpSqliteConnection(
  sqlite: Sqlite,
  intercept?: ExecuteInterceptor,
): FakeOpSqliteConnection {
  const guardedExecute = (
    sql: string,
    params: MigrationParam[] = [],
  ): FakeQueryResult => {
    const failure = intercept?.(sql);
    if (failure) {
      throw failure;
    }
    return executeSql(sqlite, sql, params);
  };

  const transaction = async (
    run: (tx: MigrationTransaction) => Promise<void>,
  ): Promise<void> => {
    sqlite.exec('BEGIN');
    try {
      await run({
        execute: async (sql, params = []) => guardedExecute(sql, params),
      });
      sqlite.exec('COMMIT');
    } catch (error) {
      sqlite.exec('ROLLBACK');
      throw error;
    }
  };

  return {
    execute: async (sql, params = []) => guardedExecute(sql, params),
    executeAsync: async (sql, params = []) => guardedExecute(sql, params),
    executeRawAsync: async (sql, params = []) =>
      sqlite
        .prepare(sql)
        .raw()
        .all(...params) as unknown[][],
    transaction,
  };
}
