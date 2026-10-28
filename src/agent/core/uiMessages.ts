import { isToolUIPart } from 'ai';
import type {
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from 'ai';
import type {
  AgentMessageRow,
  CreateAgentMessageInput,
} from '@pennyspring/api';

import { DEFAULT_HISTORY_LIMIT } from './messages';
import type { TokenUsage } from './types';

type AgentUiPart = UIMessagePart<UIDataTypes, UITools>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUiMessage(value: unknown): value is UIMessage {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.id !== 'string' || value.id.length === 0) {
    return false;
  }
  if (
    value.role !== 'system' &&
    value.role !== 'user' &&
    value.role !== 'assistant'
  ) {
    return false;
  }
  return (
    Array.isArray(value.parts) &&
    value.parts.every(
      part => isRecord(part) && typeof part.type === 'string',
    )
  );
}

export function parsePersistedUiMessage(raw: string): UIMessage | null {
  if (!raw.trim()) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  return isUiMessage(parsed) ? parsed : null;
}

export function rowsToUiMessages(
  rows: readonly AgentMessageRow[],
): UIMessage[] {
  return rows
    .map(row => parsePersistedUiMessage(row.message))
    .filter((message): message is UIMessage => message !== null);
}

export function toPersistedUiInput(
  message: UIMessage,
  usage?: TokenUsage,
): CreateAgentMessageInput | null {
  if (message.role === 'system') {
    return null;
  }

  return {
    role: message.role,
    message: JSON.stringify(message),
    ...(usage ? { usage: JSON.stringify(usage) } : {}),
  };
}

export function getUiMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<AgentUiPart, { type: 'text' }> =>
        part.type === 'text',
    )
    .map(part => part.text)
    .join('\n')
    .trim();
}

export function hasUiMessageContent(message: UIMessage): boolean {
  return message.parts.some(part => {
    if (part.type === 'text') {
      return part.text.trim().length > 0;
    }
    return isToolUIPart(part);
  });
}

export function trimUiMessages(
  messages: readonly UIMessage[],
  limit: number = DEFAULT_HISTORY_LIMIT,
): UIMessage[] {
  const size = Math.max(1, Math.floor(limit));
  if (messages.length <= size) {
    return [...messages];
  }

  let start = messages.length - size;
  while (start < messages.length && messages[start]?.role !== 'user') {
    start += 1;
  }

  return start < messages.length ? messages.slice(start) : messages.slice(-1);
}
