import { isMultimodalModel } from '../../agent/providers/models';
import type {
  AgentModelConfig,
  AgentProviderConfig,
} from '../../agent/providers/types';

export interface QuickBookModelSettings {
  providerId: string | null;
  modelId: string | null;
}

export type QuickBookModelResolution =
  | {
      ok: true;
      provider: AgentProviderConfig;
      model: AgentModelConfig;
    }
  | {
      ok: false;
      reason: 'provider-missing' | 'model-missing' | 'model-not-multimodal';
    };

export function resolveQuickBookModel(
  providers: readonly AgentProviderConfig[],
  settings: QuickBookModelSettings,
): QuickBookModelResolution {
  if (!settings.providerId) {
    return { ok: false, reason: 'provider-missing' };
  }
  const provider = providers.find(item => item.id === settings.providerId);
  if (!provider) {
    return { ok: false, reason: 'provider-missing' };
  }
  const model = provider.models.find(item => item.modelId === settings.modelId);
  if (!model) {
    return { ok: false, reason: 'model-missing' };
  }
  if (!isMultimodalModel(model)) {
    return { ok: false, reason: 'model-not-multimodal' };
  }
  return { ok: true, provider, model };
}

export function getDefaultQuickBookModel(
  provider: AgentProviderConfig,
): AgentModelConfig | null {
  return provider.models.find(model => model.multimodal) ?? null;
}
