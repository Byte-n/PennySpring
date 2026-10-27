import type {
  ChatMessage,
  StreamEvent,
  TokenUsage,
  ToolCall,
  ToolDefinition,
} from '../types'
import { AgentError } from './errors'

export interface ChatRequestPayload {
  model: string
  stream: true
  messages: Array<Record<string, unknown>>
  tools?: Array<Record<string, unknown>>
  tool_choice?: 'auto'
}

export interface ChatRequestInput {
  model: string
  messages: readonly ChatMessage[]
  tools: readonly ToolDefinition[]
}

export interface SseParser {
  push: (chunk: string) => StreamEvent[]
}

export interface ToolCallAccumulator {
  apply: (event: Extract<StreamEvent, { type: 'tool-call-delta' }>) => void
  list: () => ToolCall[]
}

interface ToolCallPart {
  id?: string
  name: string
  arguments: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readUsage(value: unknown): TokenUsage | undefined {
  if (!isRecord(value)) {
    return undefined
  }
  return {
    promptTokens: readNumber(value.prompt_tokens),
    completionTokens: readNumber(value.completion_tokens),
    totalTokens: readNumber(value.total_tokens),
  }
}

function toOpenAIMessage(message: ChatMessage): Record<string, unknown> {
  if (message.role === 'assistant') {
    return {
      role: 'assistant',
      content: message.content,
      ...(message.toolCalls?.length
        ? {
            tool_calls: message.toolCalls.map(call => ({
              id: call.id,
              type: 'function',
              function: {
                name: call.name,
                arguments: call.arguments,
              },
            })),
          }
        : {}),
    }
  }

  if (message.role === 'tool') {
    return {
      role: 'tool',
      content: message.content,
      tool_call_id: message.toolCallId ?? '',
    }
  }

  return { role: message.role, content: message.content }
}

function toOpenAITool(tool: ToolDefinition): Record<string, unknown> {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }
}

export function buildChatRequest(input: ChatRequestInput): ChatRequestPayload {
  return {
    model: input.model,
    stream: true,
    messages: input.messages.map(toOpenAIMessage),
    ...(input.tools.length
      ? {
          tools: input.tools.map(toOpenAITool),
          tool_choice: 'auto' as const,
        }
      : {}),
  }
}

function parseToolCallDelta(part: unknown): StreamEvent | null {
  if (!isRecord(part)) {
    return null
  }

  const index = typeof part.index === 'number' ? part.index : 0
  const id = typeof part.id === 'string' && part.id.length > 0 ? part.id : undefined
  const fn = isRecord(part.function) ? part.function : undefined
  const name = typeof fn?.name === 'string' && fn.name.length > 0 ? fn.name : undefined
  const argumentsDelta =
    typeof fn?.arguments === 'string' ? fn.arguments : undefined

  if (id === undefined && name === undefined && argumentsDelta === undefined) {
    return null
  }

  return {
    type: 'tool-call-delta',
    index,
    ...(id === undefined ? {} : { id }),
    ...(name === undefined ? {} : { name }),
    ...(argumentsDelta === undefined ? {} : { argumentsDelta }),
  }
}

function parseDataLine(data: string): StreamEvent[] {
  if (!data || data === '[DONE]') {
    return []
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(data)
  } catch {
    return []
  }

  if (!isRecord(parsed)) {
    return []
  }

  if (parsed.error !== undefined) {
    const error = parsed.error
    const message =
      isRecord(error) && typeof error.message === 'string'
        ? error.message
        : typeof error === 'string'
          ? error
          : '未知错误'
    throw new AgentError('bad-response', `模型服务返回错误：${message}`)
  }

  const events: StreamEvent[] = []
  const choices = Array.isArray(parsed.choices) ? parsed.choices : []

  for (const choice of choices) {
    if (!isRecord(choice)) {
      continue
    }

    const delta = isRecord(choice.delta) ? choice.delta : undefined
    if (typeof delta?.content === 'string' && delta.content.length > 0) {
      events.push({ type: 'text', delta: delta.content })
    }

    if (Array.isArray(delta?.tool_calls)) {
      for (const part of delta.tool_calls) {
        const event = parseToolCallDelta(part)
        if (event) {
          events.push(event)
        }
      }
    }

    const finishReason =
      typeof choice.finish_reason === 'string' && choice.finish_reason.length > 0
        ? choice.finish_reason
        : undefined
    const usage = readUsage(parsed.usage)

    if (finishReason) {
      events.push({
        type: 'finish',
        reason: finishReason,
        ...(usage ? { usage } : {}),
      })
    } else if (usage) {
      events.push({ type: 'usage', usage })
    }
  }

  if (choices.length === 0) {
    const usage = readUsage(parsed.usage)
    if (usage) {
      events.push({ type: 'usage', usage })
    }
  }

  return events
}

export function createSseParser(): SseParser {
  let buffer = ''

  return {
    push(chunk: string): StreamEvent[] {
      buffer += chunk
      const events: StreamEvent[] = []
      let newlineIndex = buffer.indexOf('\n')

      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, '')
        buffer = buffer.slice(newlineIndex + 1)

        if (line.startsWith('data:')) {
          events.push(...parseDataLine(line.slice(5).trim()))
        }

        newlineIndex = buffer.indexOf('\n')
      }

      return events
    },
  }
}

export function createToolCallAccumulator(): ToolCallAccumulator {
  const parts = new Map<number, ToolCallPart>()

  return {
    apply(event): void {
      const existing = parts.get(event.index) ?? { name: '', arguments: '' }
      parts.set(event.index, {
        id: event.id ?? existing.id,
        name: event.name ?? existing.name,
        arguments: event.argumentsDelta
          ? existing.arguments + event.argumentsDelta
          : existing.arguments,
      })
    },
    list(): ToolCall[] {
      return [...parts.entries()]
        .sort(([left], [right]) => left - right)
        .map(([index, part]) => ({
          id: part.id ?? `call_${index}`,
          name: part.name,
          arguments: part.arguments || '{}',
        }))
    },
  }
}
