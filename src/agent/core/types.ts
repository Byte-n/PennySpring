export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AgentDisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  hasToolCalls: boolean;
}
