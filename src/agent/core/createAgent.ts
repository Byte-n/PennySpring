import { ToolLoopAgent, stepCountIs, type ToolSet } from 'ai';

import { createProviderModel } from '../providers/createModel';
import { buildProviderOptions } from '../providers/providerOptions';
import type { AgentModelConfig, AgentProviderConfig } from '../providers/types';
import { DEFAULT_MAX_STEPS } from './constants';

export interface CreateAgentOptions {
  provider: AgentProviderConfig;
  model: AgentModelConfig;
  apiKey: string;
  systemPrompt: string;
  tools: ToolSet;
}

export function createAgent(
  options: CreateAgentOptions,
): ToolLoopAgent<never, ToolSet> {
  return new ToolLoopAgent({
    model: createProviderModel(
      options.provider,
      options.model.modelId,
      options.apiKey,
    ),
    instructions: options.systemPrompt,
    tools: options.tools,
    stopWhen: stepCountIs(DEFAULT_MAX_STEPS),
    maxRetries: 0,
    providerOptions: buildProviderOptions(options.provider, options.model),
  });
}
