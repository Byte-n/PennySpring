import { asc, eq } from 'drizzle-orm'

import { agentMessages, agentThreads } from '../schema'
import type { Database } from '../types'
import type {
  AgentMessageRow,
  AgentThreadDetail,
  AgentThreadRow,
  CreateAgentMessageInput,
} from './types'

async function getThreadRow(db: Database, threadId: number): Promise<AgentThreadRow> {
  const row = await db.select().from(agentThreads).where(eq(agentThreads.id, threadId)).get()
  if (!row) {
    throw new Error(`会话不存在: ${threadId}`)
  }
  return row
}

/**
 * 取得账本的连续会话；不存在时创建。
 * 一期按「一个账本一条会话」建模，故 booksId 唯一。
 */
export async function getOrCreateThread(db: Database, booksId: number): Promise<AgentThreadRow> {
  const existing = await db
    .select()
    .from(agentThreads)
    .where(eq(agentThreads.booksId, booksId))
    .get()
  if (existing) return existing

  let created: AgentThreadRow | undefined
  await db.transaction(async tx => {
    const rows = await tx.insert(agentThreads).values({ booksId, title: '' }).returning()
    created = rows[0]
  })
  if (!created) {
    throw new Error('创建会话失败')
  }
  return created
}

export async function getThreadWithMessages(
  db: Database,
  booksId: number
): Promise<AgentThreadDetail> {
  const thread = await getOrCreateThread(db, booksId)
  const messages = await db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.threadId, thread.id))
    .orderBy(asc(agentMessages.id))
    .all()
  return { thread, messages }
}

/**
 * 追加消息；按传入顺序一次性写入，工具调用链（assistant + tool）共用同一个事务。
 * 会话存在性校验放在事务之前：better-sqlite3 下事务回调内的异常会变成未捕获 rejection。
 */
export async function appendMessages(
  db: Database,
  threadId: number,
  inputs: CreateAgentMessageInput[]
): Promise<AgentMessageRow[]> {
  if (inputs.length === 0) return []
  await getThreadRow(db, threadId)
  return db.transaction(async tx =>
    tx
      .insert(agentMessages)
      .values(
        inputs.map(input => ({
          threadId,
          role: input.role,
          content: input.content ?? '',
          toolCalls: input.toolCalls ?? '',
          toolCallId: input.toolCallId ?? '',
          toolName: input.toolName ?? '',
          usage: input.usage ?? '',
        }))
      )
      .returning()
  )
}

export async function updateThreadTitle(
  db: Database,
  threadId: number,
  title: string
): Promise<AgentThreadRow> {
  const normalized = title.trim()
  if (!normalized) {
    throw new Error('会话标题不能为空')
  }
  await getThreadRow(db, threadId)
  await db.transaction(async tx => {
    await tx.update(agentThreads).set({ title: normalized }).where(eq(agentThreads.id, threadId))
  })
  return getThreadRow(db, threadId)
}

export async function clearThreadMessages(db: Database, threadId: number): Promise<void> {
  await getThreadRow(db, threadId)
  await db.transaction(async tx => {
    await tx.delete(agentMessages).where(eq(agentMessages.threadId, threadId))
  })
}
