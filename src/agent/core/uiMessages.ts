import { isReasoningUIPart, isToolUIPart } from 'ai';
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from 'ai';
import type {
  AgentMessageRow,
  CreateAgentMessageInput,
} from '@pennyspring/api';

import {
  AGENT_IMAGE_TOKEN_ESTIMATE,
  AGENT_MAX_HISTORY_MESSAGES,
  AGENT_MESSAGE_TOKEN_OVERHEAD,
} from './constants';
import { isUiFilePart } from './attachments';
import { estimateTokens } from './tokens';
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
    value.parts.every(part => isRecord(part) && typeof part.type === 'string')
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
  const messages: UIMessage[] = [];
  const indexById = new Map<string, number>();

  for (const row of rows) {
    const message = parsePersistedUiMessage(row.message);
    if (!message) {
      continue;
    }
    const existingIndex = indexById.get(message.id);
    if (existingIndex === undefined) {
      indexById.set(message.id, messages.length);
      messages.push(message);
    } else {
      messages[existingIndex] = message;
    }
  }

  return messages;
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
    if (isReasoningUIPart(part)) {
      return part.text.trim().length > 0;
    }
    return isUiFilePart(part) || isToolUIPart(part);
  });
}

function estimateMessageTokens(message: UIMessage): number {
  const fileParts = message.parts.filter(isUiFilePart);
  const parts =
    fileParts.length === 0
      ? message.parts
      : message.parts.filter(part => !isUiFilePart(part));

  return (
    estimateTokens(JSON.stringify({ ...message, parts })) +
    fileParts.length * AGENT_IMAGE_TOKEN_ESTIMATE +
    AGENT_MESSAGE_TOKEN_OVERHEAD
  );
}

export function trimUiMessagesByTokens(
  messages: readonly UIMessage[],
  tokenBudget: number,
): UIMessage[] {
  if (messages.length === 0) {
    return [];
  }

  const budget = Number.isFinite(tokenBudget)
    ? Math.max(1, Math.floor(tokenBudget))
    : 1;
  let start = messages.length;
  let total = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message) {
      continue;
    }
    const cost = estimateMessageTokens(message);
    if (start < messages.length && total + cost > budget) {
      break;
    }
    total += cost;
    start = index;
    if (messages.length - start >= AGENT_MAX_HISTORY_MESSAGES) {
      break;
    }
  }

  while (start < messages.length && messages[start]?.role !== 'user') {
    start += 1;
  }

  return start < messages.length ? messages.slice(start) : messages.slice(-1);
}
