import { ToolLoopAgent, stepCountIs, type ToolSet } from 'ai';

import { createProviderModel } from '../providers/createModel';
import { buildProviderOptions } from '../providers/providerOptions';
import type { AgentProviderConfig } from '../providers/types';
import { DEFAULT_MAX_STEPS } from './constants';

export interface CreateAgentOptions {
  provider: AgentProviderConfig;
  apiKey: string;
  systemPrompt: string;
  tools: ToolSet;
}

export function createAgent(
  options: CreateAgentOptions,
): ToolLoopAgent<never, ToolSet> {
  return new ToolLoopAgent({
    model: createProviderModel(options.provider, options.apiKey),
    instructions: options.systemPrompt,
    tools: options.tools,
    stopWhen: stepCountIs(DEFAULT_MAX_STEPS),
    maxRetries: 0,
    providerOptions: buildProviderOptions(options.provider),
  });
}
