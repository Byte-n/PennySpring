import Database from 'better-sqlite3'
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { schema, type DataSchema, type Database as CanonicalDatabase } from '@pennyspring/data'

export type BetterSqliteConnection = InstanceType<typeof Database>

/**
 * 创建异步包装的 Database 实例。
 * better-sqlite3 是同步的，但 canonical Database 需要异步事务支持。
 * 手动实现事务包装以支持异步回调。
 */
export function createDatabase(connection: BetterSqliteConnection): BetterSQLite3Database<DataSchema> {
  const syncDb = drizzle(connection, { schema })

  // 包装 transaction 方法以支持异步回调
  const originalTransaction = syncDb.transaction.bind(syncDb)

  ;(syncDb as any).transaction = async function<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    connection.exec('BEGIN')
    try {
      const result = await fn(syncDb as any)
      connection.exec('COMMIT')
      return result
    } catch (error) {
      connection.exec('ROLLBACK')
      throw error
    }
  }

  return syncDb
}
