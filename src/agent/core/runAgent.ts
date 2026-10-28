import {
  ToolLoopAgent,
  stepCountIs,
  type ModelMessage,
  type ToolSet,
} from 'ai';

import type { AgentProviderConfig } from '../providers/types';
import { createProviderModel } from '../providers/createModel';
import { buildProviderOptions } from '../providers/providerOptions';
import { createAbortedError } from './protocol/errors';
import { selectRecentModelMessages, toTokenUsage } from './messages';
import type { TokenUsage } from './types';

export const DEFAULT_MAX_STEPS = 3;
export const AGENT_TIMEOUT_MS = 120_000;
export const AGENT_CHUNK_TIMEOUT_MS = 60_000;

export interface RunAgentOptions {
  provider: AgentProviderConfig;
  apiKey: string;
  messages: readonly ModelMessage[];
  systemPrompt: string;
  tools: ToolSet;
  signal: AbortSignal;
  onText: (delta: string) => void;
  onToolStart?: (toolName: string) => void;
  onToolEnd?: () => void;
}

export interface RunAgentResult {
  messages: ModelMessage[];
  usage: TokenUsage;
  text: string;
}

export async function runAgent(
  options: RunAgentOptions,
): Promise<RunAgentResult> {
  const model = createProviderModel(options.provider, options.apiKey);
  const agent = new ToolLoopAgent({
    model,
    instructions: options.systemPrompt,
    tools: options.tools,
    stopWhen: stepCountIs(DEFAULT_MAX_STEPS),
    maxRetries: 0,
    providerOptions: buildProviderOptions(options.provider),
  });

  const result = await agent.stream({
    messages: selectRecentModelMessages(options.messages),
    abortSignal: options.signal,
    timeout: {
      totalMs: AGENT_TIMEOUT_MS,
      chunkMs: AGENT_CHUNK_TIMEOUT_MS,
    },
  });

  for await (const part of result.fullStream) {
    if (part.type === 'text-delta') {
      options.onText(part.text);
      continue;
    }
    if (part.type === 'tool-call') {
      options.onToolStart?.(part.toolName);
      continue;
    }
    if (part.type === 'tool-result' || part.type === 'tool-error') {
      options.onToolEnd?.();
      continue;
    }
    if (part.type === 'error') {
      throw part.error;
    }
    if (part.type === 'abort') {
      if (options.signal.aborted) {
        throw createAbortedError();
      }
    }
  }

  if (options.signal.aborted) {
    throw createAbortedError();
  }

  const messages = await result.responseMessages;
  const usage = toTokenUsage(await result.totalUsage);
  const text = await result.text;

  return {
    messages: messages as ModelMessage[],
    usage,
    text,
  };
}
