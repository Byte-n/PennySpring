import type { ChatMessage } from './types'

export const DEFAULT_HISTORY_LIMIT = 20

/**
 * 取最近的历史消息，且不切断 assistant(tool_calls) 与其 tool 结果的配对：
 * 若窗口起点落在 tool 消息上，则向前扩展到对应的 assistant 消息。
 * 首部 system 消息始终保留——窗口只限制对话消息数量。
 */
export function selectRecentMessages(
  messages: readonly ChatMessage[],
  limit: number = DEFAULT_HISTORY_LIMIT,
): readonly ChatMessage[] {
  const size = Math.max(1, Math.floor(limit))
  if (messages.length <= size) {
    return messages
  }

  let systemEnd = 0
  while (systemEnd < messages.length && messages[systemEnd]?.role === 'system') {
    systemEnd += 1
  }

  const conversation = messages.slice(systemEnd)
  if (conversation.length <= size) {
    return messages
  }

  let start = conversation.length - size
  while (start > 0 && conversation[start]?.role === 'tool') {
    start -= 1
  }

  return [...messages.slice(0, systemEnd), ...conversation.slice(start)]
}
