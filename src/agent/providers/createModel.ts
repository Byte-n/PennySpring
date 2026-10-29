import type { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

import { createXhrFetch } from '../runtime/xhrFetch';
import { requireProviderDescriptor } from './catalog';
import type { AgentProviderConfig } from './types';

const agentFetch = createXhrFetch();

export function createProviderModel(
  config: AgentProviderConfig,
  modelId: string,
  apiKey: string,
): LanguageModel {
  const descriptor = requireProviderDescriptor(config.descriptorId);
  const baseURL = config.baseUrl;
  const key = apiKey.trim() || undefined;

  if (descriptor.apiKind === 'openai-compatible') {
    return createOpenAICompatible({
      name: config.name || descriptor.name,
      baseURL,
      apiKey: key,
      fetch: agentFetch,
    })(modelId);
  }

  const openai = createOpenAI({
    baseURL,
    apiKey: key,
    fetch: agentFetch,
  });

  if (descriptor.apiKind === 'responses') {
    return openai.responses(modelId);
  }

  return openai.chat(modelId);
}
