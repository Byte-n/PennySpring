jest.mock('@pennyspring/data-server', () => ({ getDatabase: jest.fn() }))
import { getDatabase } from '@pennyspring/data-server'
import type { Database } from '@pennyspring/data'
import { initializeDatabase } from '../packages/data-server-wrapper/src/startup'

const mockGetDatabase = jest.mocked(getDatabase)

describe('data-server 启动初始化', () => {
  it('在返回前完成数据库迁移', async () => {
    const database = {} as Database
    mockGetDatabase.mockResolvedValueOnce(database)

    const result = await initializeDatabase('/tmp/server.db')

    expect(result).toBe(database)
    expect(mockGetDatabase).toHaveBeenCalledWith('/tmp/server.db')
  })
})
