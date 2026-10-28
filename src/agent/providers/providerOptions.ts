import { requireProviderDescriptor } from './catalog';
import type { AgentProviderConfig } from './types';

// 用 type 而非 interface：interface 没有隐式索引签名，无法直接赋给 ProviderOptions
export type ResponsesProviderOptions = {
  openai: { store: boolean };
};

export function buildProviderOptions(
  config: AgentProviderConfig,
): ResponsesProviderOptions | undefined {
  const descriptor = requireProviderDescriptor(config.descriptorId);
  if (descriptor.apiKind !== 'responses' || config.storeResponses) {
    return undefined;
  }
  return { openai: { store: false } };
}
