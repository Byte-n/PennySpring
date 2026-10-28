import type { ProviderDescriptor } from './types';

export const OPENAI_RESPONSES_PROVIDER_ID = 'openai-responses';
export const OPENAI_CHAT_PROVIDER_ID = 'openai-chat';
export const OPENAI_COMPATIBLE_PROVIDER_ID = 'openai-compatible';

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

export const PROVIDER_DESCRIPTORS: readonly ProviderDescriptor[] = [
  {
    id: OPENAI_RESPONSES_PROVIDER_ID,
    name: 'OpenAI（Responses）',
    description: '走 OpenAI Responses API，请求 /responses。',
    apiKind: 'responses',
    defaultBaseUrl: OPENAI_BASE_URL,
    baseUrlHint: 'https://host/v1',
    modelPlaceholder: '例如 gpt-5',
    requiresApiKey: true,
  },
  {
    id: OPENAI_CHAT_PROVIDER_ID,
    name: 'OpenAI（Chat Completions）',
    description: '走 OpenAI Chat Completions，请求 /chat/completions。',
    apiKind: 'chat',
    defaultBaseUrl: OPENAI_BASE_URL,
    baseUrlHint: 'https://host/v1',
    modelPlaceholder: '例如 gpt-4.1',
    requiresApiKey: true,
  },
  {
    id: OPENAI_COMPATIBLE_PROVIDER_ID,
    name: 'OpenAI 兼容接口',
    description: '适用于第三方 /chat/completions 兼容端点。',
    apiKind: 'openai-compatible',
    defaultBaseUrl: '',
    baseUrlHint: 'https://host/v1',
    modelPlaceholder: '例如 deepseek-chat',
    requiresApiKey: true,
  },
];

export function getProviderDescriptor(
  descriptorId: string,
): ProviderDescriptor | undefined {
  return PROVIDER_DESCRIPTORS.find(item => item.id === descriptorId);
}

export function requireProviderDescriptor(
  descriptorId: string,
): ProviderDescriptor {
  const descriptor = getProviderDescriptor(descriptorId);
  if (descriptor === undefined) {
    throw new Error(`不支持的提供商类型：${descriptorId}`);
  }
  return descriptor;
}
