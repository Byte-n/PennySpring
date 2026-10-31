import { asc, desc, eq } from 'drizzle-orm'

import { agentMessages, agentThreads } from '../schema'
import type { Database } from '../types'
import { validateAgentSelection } from './agent-provider-service'
import { validateBookExists } from './helpers'
import type {
  AgentMessageRow,
  AgentSelection,
  AgentThreadDetail,
  AgentThreadRow,
  CreateAgentMessageInput,
  Tx,
} from './types'

async function getThreadRow(
  db: Database | Tx,
  threadId: number,
): Promise<AgentThreadRow> {
  const row = await db.select().from(agentThreads).where(eq(agentThreads.id, threadId)).get()
  if (!row) {
    throw new Error(`会话不存在: ${threadId}`)
  }
  return row
}

export function createThread(
  db: Database,
  booksId: number,
  selection: AgentSelection,
): Promise<AgentThreadRow> {
  return db.transaction(async tx => {
    await validateBookExists(tx, { booksId }, 'booksId')
    await validateAgentSelection(tx, selection)

    const rows = await tx
      .insert(agentThreads)
      .values({
        booksId,
        title: '',
        providerId: selection.providerId,
        modelId: selection.modelId,
      })
      .returning()
    const created = rows[0]
    if (!created) {
      throw new Error('创建会话失败')
    }
    return created
  })
}

export async function listThreads(db: Database, booksId: number): Promise<AgentThreadRow[]> {
  return db
    .select()
    .from(agentThreads)
    .where(eq(agentThreads.booksId, booksId))
    .orderBy(desc(agentThreads.updatedTime), desc(agentThreads.id))
    .all()
}

export async function getThreadDetail(
  db: Database,
  threadId: number
): Promise<AgentThreadDetail> {
  const thread = await getThreadRow(db, threadId)
  const messages = await db
    .select()
    .from(agentMessages)
    .where(eq(agentMessages.threadId, thread.id))
    .orderBy(asc(agentMessages.id))
    .all()
  return { thread, messages }
}

/**
 * 启动时恢复最近更新的会话；账本还没有会话时创建一条空会话。
 */
export async function getLatestThreadWithMessages(
  db: Database,
  booksId: number,
  _selection?: AgentSelection,
): Promise<AgentThreadDetail | null> {
  const latest = await db
    .select()
    .from(agentThreads)
    .where(eq(agentThreads.booksId, booksId))
    .orderBy(desc(agentThreads.updatedTime), desc(agentThreads.id))
    .get()
  return latest ? getThreadDetail(db, latest.id) : null
}

export function updateThreadModel(
  db: Database,
  threadId: number,
  selection: AgentSelection,
): Promise<AgentThreadRow> {
  return db.transaction(async tx => {
    await getThreadRow(tx, threadId)
    await validateAgentSelection(tx, selection)
    await tx
      .update(agentThreads)
      .set({ providerId: selection.providerId, modelId: selection.modelId })
      .where(eq(agentThreads.id, threadId))
    return getThreadRow(tx, threadId)
  })
}

/**
 * 追加消息；按传入顺序一次性写入，工具调用链（assistant + tool）共用同一个事务。
 * 同时刷新会话更新时间，保证会话列表按最近活动排序。
 * 会话存在性校验放在事务之前：better-sqlite3 下事务回调内的异常会变成未捕获 rejection。
 */
export async function appendMessages(
  db: Database,
  threadId: number,
  inputs: CreateAgentMessageInput[]
): Promise<AgentMessageRow[]> {
  if (inputs.length === 0) return []
  await getThreadRow(db, threadId)
  return db.transaction(async tx => {
    const rows = await tx
      .insert(agentMessages)
      .values(
        inputs.map(input => ({
          threadId,
          role: input.role,
          message: input.message ?? '',
          usage: input.usage ?? '',
        }))
      )
      .returning()
    await tx.update(agentThreads).set({ updatedTime: Date.now() }).where(eq(agentThreads.id, threadId))
    return rows
  })
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

export async function deleteThread(db: Database, threadId: number): Promise<void> {
  await getThreadRow(db, threadId)
  await db.transaction(async tx => {
    await tx.delete(agentMessages).where(eq(agentMessages.threadId, threadId))
    await tx.delete(agentThreads).where(eq(agentThreads.id, threadId))
  })
}
