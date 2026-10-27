export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ToolCall {
  id: string
  name: string
  arguments: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: ToolCall[]
  toolCallId?: string
  toolName?: string
  usage?: TokenUsage
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export type StreamEvent =
  | { type: 'text'; delta: string }
  | {
      type: 'tool-call-delta'
      index: number
      id?: string
      name?: string
      argumentsDelta?: string
    }
  | { type: 'finish'; reason: string; usage?: TokenUsage }
  | { type: 'usage'; usage: TokenUsage }

export interface TransportRequest {
  messages: readonly ChatMessage[]
  tools: readonly ToolDefinition[]
  signal?: AbortSignal
}

export type Transport = (request: TransportRequest) => AsyncIterable<StreamEvent>

export type ToolExecutor = (call: ToolCall) => Promise<string>
