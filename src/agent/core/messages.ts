import type { LanguageModelUsage } from 'ai';
import type { AgentMessageRow } from '@pennyspring/api';

import type { TokenUsage } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
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

export const EMPTY_USAGE: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

export function addUsage(total: TokenUsage, delta: TokenUsage): TokenUsage {
  return {
    promptTokens: total.promptTokens + delta.promptTokens,
    completionTokens: total.completionTokens + delta.completionTokens,
    totalTokens: total.totalTokens + delta.totalTokens,
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

  const promptTokens = readNumber(parsed.promptTokens);
  const completionTokens = readNumber(parsed.completionTokens);
  const totalTokens =
    readNumber(parsed.totalTokens) || promptTokens + completionTokens;

  return { promptTokens, completionTokens, totalTokens };
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
