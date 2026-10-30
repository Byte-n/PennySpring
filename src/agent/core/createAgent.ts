import {
  ToolLoopAgent,
  stepCountIs,
  type ToolLoopAgentSettings,
  type ToolSet,
} from 'ai';

import { requireProviderDescriptor } from '../providers/catalog';
import { createProviderModel } from '../providers/createModel';
import { buildProviderOptions } from '../providers/providerOptions';
import type {
  AgentModelConfig,
  AgentProviderConfig,
  AgentReasoningEffort,
} from '../providers/types';
import { DEFAULT_MAX_STEPS } from './constants';

export interface CreateAgentOptions {
  provider: AgentProviderConfig;
  model: AgentModelConfig;
  apiKey: string;
  systemPrompt: string;
  tools: ToolSet;
  toolApproval?: ToolLoopAgentSettings<never, ToolSet>['toolApproval'];
}

function alibabaReasoning(
  provider: AgentProviderConfig,
  effort: AgentReasoningEffort,
): 'none' | Exclude<AgentReasoningEffort, 'off'> | undefined {
  const descriptor = requireProviderDescriptor(provider.descriptorId);
  if (descriptor.apiKind !== 'alibaba') {
    return undefined;
  }
  return effort === 'off' ? 'none' : effort;
}

export function createAgent(
  options: CreateAgentOptions,
): ToolLoopAgent<never, ToolSet> {
  const reasoning = alibabaReasoning(
    options.provider,
    options.model.reasoningEffort,
  );

  return new ToolLoopAgent({
    model: createProviderModel(
      options.provider,
      options.model.modelId,
      options.apiKey,
    ),
    instructions: options.systemPrompt,
    tools: options.tools,
    toolApproval: options.toolApproval,
    stopWhen: stepCountIs(DEFAULT_MAX_STEPS),
    maxRetries: 0,
    providerOptions: buildProviderOptions(options.provider, options.model),
    ...(reasoning ? { reasoning } : {}),
  });
}
