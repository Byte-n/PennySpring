import { getProviderDescriptor } from './catalog';
import type { AgentProviderConfig } from './types';

export function getProviderDisplayName(
  provider: AgentProviderConfig,
): string {
  return (
    provider.name.trim() ||
    getProviderDescriptor(provider.descriptorId)?.name ||
    '未命名提供商'
  );
}
