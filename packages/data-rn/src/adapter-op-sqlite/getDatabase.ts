import type { Database } from '@pennyspring/data'

import { createDatabase } from './database'
import { runMigrations } from './migrate'

let dbInstance: Database | null = null
let dbInitializationPromise: Promise<Database> | null = null

/**
 * 取得就绪 Database 句柄（open → createDatabase → runMigrations → memo）。
 * 不在此开业务事务；事务边界保留在 services。单例：op-sqlite open({name}) 隐式落 App 文档目录。
 */
export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance
  if (dbInitializationPromise) return dbInitializationPromise

  dbInitializationPromise = (async () => {
    const { open } = await import('@op-engineering/op-sqlite')
    const connection = open({ name: 'pennyspring.db' })
    const database = createDatabase(connection)
    await runMigrations(database)
    dbInstance = database
    return database
  })()

  try {
    return await dbInitializationPromise
  } finally {
    dbInitializationPromise = null
  }
}
