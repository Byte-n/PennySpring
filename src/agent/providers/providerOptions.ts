import { requireProviderDescriptor } from './catalog';
import type { AgentModelConfig, AgentProviderConfig } from './types';

type OpenAIProviderOptions = {
  store?: boolean;
  reasoningEffort?: string;
};

// 用 type 而非 interface：interface 没有隐式索引签名，无法直接赋给 ProviderOptions
export type AgentProviderOptions = {
  openai?: OpenAIProviderOptions;
  openaiCompatible?: { reasoningEffort?: string };
};

function reasoningEffortOf(model: AgentModelConfig): string | undefined {
  return model.reasoningEffort === 'off' ? undefined : model.reasoningEffort;
}

export function buildProviderOptions(
  config: AgentProviderConfig,
  model: AgentModelConfig,
): AgentProviderOptions | undefined {
  const descriptor = requireProviderDescriptor(config.descriptorId);
  const reasoningEffort = reasoningEffortOf(model);

  if (descriptor.apiKind === 'openai-compatible') {
    return reasoningEffort
      ? { openaiCompatible: { reasoningEffort } }
      : undefined;
  }

  const openaiOptions: OpenAIProviderOptions = {};
  if (descriptor.apiKind === 'responses' && !config.storeResponses) {
    openaiOptions.store = false;
  }
  if (reasoningEffort) {
    openaiOptions.reasoningEffort = reasoningEffort;
  }

  return Object.keys(openaiOptions).length > 0
    ? { openai: openaiOptions }
    : undefined;
}
