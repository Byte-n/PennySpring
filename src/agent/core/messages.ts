import type { LanguageModelUsage, ModelMessage } from 'ai';
import type { AgentMessageRow, CreateAgentMessageInput } from '@pennyspring/api';

import type { AgentDisplayMessage, TokenUsage } from './types';

export const DEFAULT_HISTORY_LIMIT = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function readMessageRole(
  value: unknown,
): ModelMessage['role'] | null {
  if (
    value === 'system' ||
    value === 'user' ||
    value === 'assistant' ||
    value === 'tool'
  ) {
    return value;
  }
  return null;
}

export function parsePersistedMessage(raw: string): ModelMessage | null {
  if (!raw.trim()) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }
  const role = readMessageRole(parsed.role);
  if (role === null || !('content' in parsed)) {
    return null;
  }

  return parsed as unknown as ModelMessage;
}

function textFromContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map(part => {
      if (!isRecord(part)) {
        return '';
      }
      if (part.type === 'text' && typeof part.text === 'string') {
        return part.text;
      }
      return '';
    })
    .join('');
}

function hasToolCallContent(content: unknown): boolean {
  return (
    Array.isArray(content) &&
    content.some(part => isRecord(part) && part.type === 'tool-call')
  );
}

export function toDisplayMessages(
  messages: readonly ModelMessage[],
): AgentDisplayMessage[] {
  const display: AgentDisplayMessage[] = [];

  for (const message of messages) {
    if (message.role === 'user') {
      const content = textFromContent(message.content);
      if (content.trim()) {
        display.push({ role: 'user', content, hasToolCalls: false });
      }
      continue;
    }

    if (message.role === 'assistant') {
      const content = textFromContent(message.content);
      const hasToolCalls = hasToolCallContent(message.content);
      if (content.trim() || hasToolCalls) {
        display.push({ role: 'assistant', content, hasToolCalls });
      }
    }
  }

  return display;
}

export function createUserModelMessage(content: string): ModelMessage {
  return { role: 'user', content };
}

export function createAssistantModelMessage(content: string): ModelMessage {
  return { role: 'assistant', content };
}

export function rowsToModelMessages(
  rows: readonly AgentMessageRow[],
): ModelMessage[] {
  return rows
    .map(row => parsePersistedMessage(row.message))
    .filter((message): message is ModelMessage => message !== null);
}

export function toPersistedInputs(
  messages: readonly ModelMessage[],
  usage?: TokenUsage,
): CreateAgentMessageInput[] {
  const rows: CreateAgentMessageInput[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      continue;
    }
    rows.push({
      role: message.role,
      message: JSON.stringify(message),
    });
  }

  if (!usage) {
    return rows;
  }

  let lastAssistantIndex = -1;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index]?.role === 'assistant') {
      lastAssistantIndex = index;
      break;
    }
  }
  if (lastAssistantIndex < 0) {
    return rows;
  }

  return rows.map((row, index) =>
    index === lastAssistantIndex
      ? { ...row, usage: JSON.stringify(usage) }
      : row,
  );
}

export function toTokenUsage(usage: LanguageModelUsage): TokenUsage {
  const promptTokens = usage.inputTokens ?? 0;
  const completionTokens = usage.outputTokens ?? 0;
  return {
    promptTokens,
    completionTokens,
    totalTokens: usage.totalTokens ?? promptTokens + completionTokens,
  };
}

export function sumUsage(
  messages: readonly AgentMessageRow[],
): TokenUsage {
  return messages.reduce<TokenUsage>(
    (total, message) => {
      const usage = parseUsage(message.usage);
      if (!usage) {
        return total;
      }
      return {
        promptTokens: total.promptTokens + usage.promptTokens,
        completionTokens: total.completionTokens + usage.completionTokens,
        totalTokens: total.totalTokens + usage.totalTokens,
      };
    },
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  );
}

export function parseUsage(raw: string): TokenUsage | undefined {
  if (!raw.trim()) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed) || Array.isArray(parsed)) {
    return undefined;
  }

  const promptTokens = readNumber(parsed.promptTokens ?? parsed.prompt_tokens);
  const completionTokens = readNumber(
    parsed.completionTokens ?? parsed.completion_tokens,
  );
  const totalTokens =
    readNumber(parsed.totalTokens ?? parsed.total_tokens) ||
    promptTokens + completionTokens;

  return { promptTokens, completionTokens, totalTokens };
}

export function selectRecentModelMessages(
  messages: readonly ModelMessage[],
  limit: number = DEFAULT_HISTORY_LIMIT,
): ModelMessage[] {
  const size = Math.max(1, Math.floor(limit));
  if (messages.length <= size) {
    return [...messages];
  }

  let start = messages.length - size;
  while (start > 0 && messages[start]?.role === 'tool') {
    start -= 1;
  }
  return messages.slice(start);
}

export function formatTokenCount(value: number): string {
  if (value < 1_000) {
    return String(value);
  }
  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return `${(value / 1_000_000).toFixed(1)}M`;
}
