import type { Database } from '@pennyspring/data'
import { getDatabase } from '@pennyspring/data-server'

/**
 * 初始化服务端数据库。
 * getDatabase 会按需打开连接、执行所有未应用迁移并完成默认数据初始化。
 */
export async function initializeDatabase(dbPath: string): Promise<Database> {
  return getDatabase(dbPath)
}
