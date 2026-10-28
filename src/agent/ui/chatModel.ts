import dayjs from 'dayjs';

import type {
  AgentMessageRoleValue,
  AgentMessageRow,
  AgentThreadRow,
  CreateAgentMessageInput,
} from '@pennyspring/api';

import type { ChatMessage, TokenUsage, ToolCall } from '../core/types';

export const NEW_THREAD_TITLE = '新对话';
const THREAD_TIME_FORMAT = 'MM-DD HH:mm';

const CHAT_ROLES = new Set<AgentMessageRoleValue>(['user', 'assistant', 'tool']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseToolCall(value: unknown): ToolCall | null {
  if (!isRecord(value)) {
    return null;
  }

  const nested = isRecord(value.function) ? value.function : undefined;
  const name =
    typeof nested?.name === 'string'
      ? nested.name
      : typeof value.name === 'string'
        ? value.name
        : '';
  if (!name) {
    return null;
  }

  const rawArguments = nested?.arguments ?? value.arguments;
  const args =
    typeof rawArguments === 'string'
      ? rawArguments
      : isRecord(rawArguments)
        ? JSON.stringify(rawArguments)
        : '{}';

  return {
    id: typeof value.id === 'string' && value.id ? value.id : `call_${name}`,
    name,
    arguments: args,
  };
}

export function parseToolCalls(raw: string): ToolCall[] {
  if (!raw.trim()) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map(parseToolCall)
    .filter((call): call is ToolCall => call !== null);
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

export function toChatMessages(
  rows: readonly AgentMessageRow[],
): ChatMessage[] {
  return rows.map(row => {
    const toolCalls = parseToolCalls(row.toolCalls);
    const usage = parseUsage(row.usage);

    return {
      role: CHAT_ROLES.has(row.role) ? row.role : 'assistant',
      content: row.content,
      ...(toolCalls.length ? { toolCalls } : {}),
      ...(row.toolCallId ? { toolCallId: row.toolCallId } : {}),
      ...(row.toolName ? { toolName: row.toolName } : {}),
      ...(usage ? { usage } : {}),
    };
  });
}

export function toPersistedInputs(
  messages: readonly ChatMessage[],
): CreateAgentMessageInput[] {
  return messages
    .filter(
      (
        message,
      ): message is ChatMessage & {
        role: 'user' | 'assistant' | 'tool';
      } => message.role !== 'system',
    )
    .map(message => ({
      role: message.role,
      content: message.content,
      ...(message.toolCalls?.length
        ? { toolCalls: JSON.stringify(message.toolCalls) }
        : {}),
      ...(message.toolCallId ? { toolCallId: message.toolCallId } : {}),
      ...(message.toolName ? { toolName: message.toolName } : {}),
      ...(message.usage ? { usage: JSON.stringify(message.usage) } : {}),
    }));
}

export function sumUsage(messages: readonly ChatMessage[]): TokenUsage {
  return messages.reduce<TokenUsage>(
    (total, message) => {
      const usage = message.usage;
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

export function formatTokenCount(value: number): string {
  if (value < 1_000) {
    return String(value);
  }
  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(1)}k`;
  }
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export function getThreadTitle(thread: AgentThreadRow): string {
  return thread.title.trim() || NEW_THREAD_TITLE;
}

export function formatThreadTime(time: number): string {
  if (!Number.isFinite(time) || time <= 0) {
    return '时间未知';
  }
  return dayjs(time).format(THREAD_TIME_FORMAT);
}
