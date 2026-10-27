import { DEFAULT_HISTORY_LIMIT, selectRecentMessages } from '../context'
import { createAbortedError } from '../protocol/errors'
import { createToolCallAccumulator } from '../protocol/openai'
import type {
  ChatMessage,
  TokenUsage,
  ToolCall,
  ToolDefinition,
  ToolExecutor,
  Transport,
} from '../types'

export const DEFAULT_MAX_STEPS = 3
export const MAX_STEPS_LIMIT = 5

export interface RunAgentOptions {
  transport: Transport
  executeTool: ToolExecutor
  messages: readonly ChatMessage[]
  tools: readonly ToolDefinition[]
  maxSteps?: number
  historyLimit?: number
  signal?: AbortSignal
  onText?: (delta: string) => void
  onToolCall?: (call: ToolCall) => void
}

export interface RunAgentResult {
  /** 仅包含本轮新产生的消息，可直接追加到会话记录。 */
  messages: ChatMessage[]
  usage: TokenUsage[]
}

function resolveMaxSteps(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_MAX_STEPS
  }
  return Math.min(MAX_STEPS_LIMIT, Math.max(1, Math.floor(value)))
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw createAbortedError()
  }
}

export async function runAgent(options: RunAgentOptions): Promise<RunAgentResult> {
  const maxSteps = resolveMaxSteps(options.maxSteps)
  const historyLimit = options.historyLimit ?? DEFAULT_HISTORY_LIMIT
  const conversation: ChatMessage[] = [...options.messages]
  const appended: ChatMessage[] = []
  const usageList: TokenUsage[] = []

  for (let step = 0; step < maxSteps; step += 1) {
    throwIfAborted(options.signal)

    const requestMessages = selectRecentMessages(conversation, historyLimit)
    const accumulator = createToolCallAccumulator()
    let text = ''
    let stepUsage: TokenUsage | undefined

    for await (const event of options.transport({
      messages: [...requestMessages],
      tools: options.tools,
      signal: options.signal,
    })) {
      throwIfAborted(options.signal)

      if (event.type === 'text') {
        text += event.delta
        options.onText?.(event.delta)
      } else if (event.type === 'tool-call-delta') {
        accumulator.apply(event)
      } else if (event.type === 'finish') {
        stepUsage = event.usage ?? stepUsage
      } else if (event.type === 'usage') {
        stepUsage = event.usage
      }
    }

    throwIfAborted(options.signal)

    const toolCalls = accumulator.list()
    if (!text && toolCalls.length === 0) {
      break
    }

    if (stepUsage) {
      usageList.push(stepUsage)
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: text,
      ...(toolCalls.length ? { toolCalls } : {}),
      ...(stepUsage ? { usage: stepUsage } : {}),
    }
    appended.push(assistantMessage)
    conversation.push(assistantMessage)

    if (toolCalls.length === 0) {
      break
    }

    for (const call of toolCalls) {
      throwIfAborted(options.signal)
      options.onToolCall?.(call)

      let content: string
      try {
        content = await options.executeTool(call)
      } catch (error) {
        content = `工具执行失败：${getErrorMessage(error)}`
      }

      throwIfAborted(options.signal)

      const toolMessage: ChatMessage = {
        role: 'tool',
        content,
        toolCallId: call.id,
        toolName: call.name,
      }
      appended.push(toolMessage)
      conversation.push(toolMessage)
    }
  }

  return { messages: appended, usage: usageList }
}
