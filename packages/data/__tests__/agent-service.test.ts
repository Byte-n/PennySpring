import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'node:path'

import { schema } from '../src/db'
import {
  appendMessages,
  clearThreadMessages,
  getOrCreateThread,
  getThreadWithMessages,
  updateThreadTitle,
} from '../src/services/agent-service'
import type { Database as AppDatabase } from '../src/types'

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../drizzle')

function createTestDatabase(): AppDatabase {
  const connection = new Database(':memory:')
  const db = drizzle(connection, { schema })
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER })
  // better-sqlite3 是同步驱动，不接受 async 事务回调（生产用的 op-sqlite 是异步驱动）。
  // 测试里让事务直通，只验证 SQL 行为；事务原子性由真实驱动保证。
  const patched = db as unknown as {
    transaction: (fn: (tx: unknown) => Promise<unknown>) => Promise<unknown>
  }
  patched.transaction = fn => fn(db)
  return db as unknown as AppDatabase
}

const TOOL_CALLS_JSON =
  '[{"id":"call_1","type":"function","function":{"name":"queryRecords","arguments":"{}"}}]'

describe('agent-service', () => {
  let db: AppDatabase

  beforeEach(() => {
    db = createTestDatabase()
  })

  it('getOrCreateThread 为同一账本复用已有会话', async () => {
    const first = await getOrCreateThread(db, 1)
    const second = await getOrCreateThread(db, 1)

    expect(second.id).toBe(first.id)
    expect(second.booksId).toBe(1)
  })

  it('getOrCreateThread 为不同账本创建独立会话', async () => {
    const first = await getOrCreateThread(db, 1)
    const second = await getOrCreateThread(db, 2)

    expect(second.id).not.toBe(first.id)
  })

  it('appendMessages 持久化完整消息链并保持写入顺序', async () => {
    const thread = await getOrCreateThread(db, 1)

    const saved = await appendMessages(db, thread.id, [
      { role: 'user', content: '这个月花了多少' },
      { role: 'assistant', content: '', toolCalls: TOOL_CALLS_JSON },
      { role: 'tool', content: '{"total":123}', toolCallId: 'call_1', toolName: 'queryRecords' },
    ])

    expect(saved.map(message => message.role)).toEqual(['user', 'assistant', 'tool'])
    expect(saved.map(message => message.threadId)).toEqual([thread.id, thread.id, thread.id])
  })

  it('getThreadWithMessages 返回可回放的完整消息链', async () => {
    const thread = await getOrCreateThread(db, 1)
    await appendMessages(db, thread.id, [
      { role: 'user', content: '这个月花了多少' },
      { role: 'assistant', content: '', toolCalls: TOOL_CALLS_JSON },
      { role: 'tool', content: '{"total":123}', toolCallId: 'call_1', toolName: 'queryRecords' },
    ])

    const detail = await getThreadWithMessages(db, 1)

    expect(detail.thread.id).toBe(thread.id)
    expect(detail.messages).toHaveLength(3)
    expect(detail.messages[1]?.toolCalls).toContain('queryRecords')
    expect(detail.messages[2]?.toolCallId).toBe('call_1')
    expect(detail.messages[2]?.toolName).toBe('queryRecords')
  })

  it('getThreadWithMessages 在账本没有会话时创建空会话', async () => {
    const detail = await getThreadWithMessages(db, 3)

    expect(detail.thread.booksId).toBe(3)
    expect(detail.messages).toEqual([])
  })

  it('updateThreadTitle 更新会话标题', async () => {
    const thread = await getOrCreateThread(db, 1)

    const updated = await updateThreadTitle(db, thread.id, '本月支出')

    expect(updated.title).toBe('本月支出')
  })

  it('updateThreadTitle 拒绝空标题', async () => {
    const thread = await getOrCreateThread(db, 1)

    await expect(updateThreadTitle(db, thread.id, '   ')).rejects.toThrow('会话标题不能为空')
  })

  it('appendMessages 拒绝写入不存在的会话', async () => {
    await expect(
      appendMessages(db, 999, [{ role: 'user', content: '你好' }])
    ).rejects.toThrow('会话不存在: 999')
  })

  it('clearThreadMessages 清空消息但保留会话', async () => {
    const thread = await getOrCreateThread(db, 1)
    await appendMessages(db, thread.id, [{ role: 'user', content: '你好' }])

    await clearThreadMessages(db, thread.id)

    const detail = await getThreadWithMessages(db, 1)
    expect(detail.thread.id).toBe(thread.id)
    expect(detail.messages).toEqual([])
  })
})
