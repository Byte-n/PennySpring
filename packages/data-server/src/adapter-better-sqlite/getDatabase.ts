import {
  ensureDefaultBook,
  type Database as CanonicalDatabase,
} from '@pennyspring/data';
import Database from 'better-sqlite3';

import { createDatabase } from './database';
import { runMigrations } from './migrate';

let dbInstance: CanonicalDatabase | null = null;

/**
 * 取得就绪 Database 句柄（better-sqlite3 → createDatabase → runMigrations → ensureDefaultBookSeeded → memo）。
 * better-sqlite3 同步；在适配器出口把 'sync' 实例断言成 canonical 'async' Database，cast 关在唯一一处。
 * 不在此开业务事务；事务边界保留在 services。
 */
export async function getDatabase(dbPath: string): Promise<CanonicalDatabase> {
  if (dbInstance) return dbInstance;
  const connection = new Database(dbPath);
  const db = createDatabase(connection);
  runMigrations(db);
  await ensureDefaultBook(db as unknown as CanonicalDatabase);
  dbInstance = db as unknown as CanonicalDatabase;
  return dbInstance;
}
