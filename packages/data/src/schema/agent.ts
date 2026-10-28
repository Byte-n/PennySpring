import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { type AgentMessageRoleValue, AGENT_MESSAGE_ROLE } from '../constants'
import { enumColumn, integerColumn, primaryKeyColumn, timestampColumns } from '../shared'

export const agentThreads = sqliteTable(
  'tb_agent_thread',
  {
    // 会话主键，自增长
    id: primaryKeyColumn(),
    // 所属账本主键，关联 tb_books.id；一个账本可有多条会话
    booksId: integerColumn('books_id').notNull(),
    // 会话标题；空字符串表示未命名
    title: text('title').notNull().default(''),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [index('tb_agent_thread_books_id_index').on(table.booksId)]
)

export const agentMessages = sqliteTable(
  'tb_agent_message',
  {
    // 消息主键，自增长
    id: primaryKeyColumn(),
    // 所属会话主键，关联 tb_agent_thread.id
    threadId: integerColumn('thread_id').notNull(),
    // 消息角色
    role: enumColumn<AgentMessageRoleValue>('role').notNull(),
    // 文本内容；仅携带工具调用的 assistant 消息为空字符串
    content: text('content').notNull().default(''),
    // assistant 消息携带的工具调用 JSON 数组；空字符串表示无
    toolCalls: text('tool_calls').notNull().default(''),
    // tool 消息对应的工具调用 ID；空字符串表示无
    toolCallId: text('tool_call_id').notNull().default(''),
    // tool 消息对应的工具名；空字符串表示无
    toolName: text('tool_name').notNull().default(''),
    // 本轮请求的 token 用量 JSON；空字符串表示未记录
    usage: text('usage').notNull().default(''),
    // 记录创建时间（时间戳，毫秒），INSERT 时自动写入
    // 最后修改时间（时间戳，毫秒）
    ...timestampColumns(),
  },
  table => [index('tb_agent_message_thread_id_index').on(table.threadId)]
)

export { AGENT_MESSAGE_ROLE }
