import type { AgentProviderConfig } from '../../src/agent/providers/types';
import {
  getDefaultQuickBookModel,
  resolveQuickBookModel,
} from '../../src/features/quickBook/validation';

const provider: AgentProviderConfig = {
  id: 'provider-1',
  descriptorId: 'openai-compatible',
  name: '测试提供商',
  baseUrl: 'https://api.example.com/v1',
  defaultModelId: 'text-model',
  models: [
    {
      modelId: 'text-model',
      contextWindow: 32_768,
      reasoningEffort: 'off',
      multimodal: false,
    },
    {
      modelId: 'vision-model',
      contextWindow: 128_000,
      reasoningEffort: 'medium',
      multimodal: true,
    },
  ],
  storeResponses: true,
  createdAt: 0,
  updatedAt: 0,
};

describe('resolveQuickBookModel', () => {
  it('returns the configured multimodal provider and model', () => {
    const result = resolveQuickBookModel([provider], {
      providerId: 'provider-1',
      modelId: 'vision-model',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider.id).toBe('provider-1');
      expect(result.model.modelId).toBe('vision-model');
    }
  });

  it('rejects a missing provider selection', () => {
    expect(
      resolveQuickBookModel([provider], { providerId: null, modelId: null }),
    ).toEqual({ ok: false, reason: 'provider-missing' });
  });

  it('rejects a provider that no longer exists', () => {
    expect(
      resolveQuickBookModel([provider], {
        providerId: 'provider-removed',
        modelId: 'vision-model',
      }),
    ).toEqual({ ok: false, reason: 'provider-missing' });
  });

  it('rejects a model that no longer exists', () => {
    expect(
      resolveQuickBookModel([provider], {
        providerId: 'provider-1',
        modelId: 'removed-model',
      }),
    ).toEqual({ ok: false, reason: 'model-missing' });
  });

  it('rejects a model without image support', () => {
    expect(
      resolveQuickBookModel([provider], {
        providerId: 'provider-1',
        modelId: 'text-model',
      }),
    ).toEqual({ ok: false, reason: 'model-not-multimodal' });
  });
});

describe('getDefaultQuickBookModel', () => {
  it('returns the first multimodal model', () => {
    expect(getDefaultQuickBookModel(provider)?.modelId).toBe('vision-model');
  });

  it('returns null when the provider has no multimodal model', () => {
    expect(
      getDefaultQuickBookModel({
        ...provider,
        models: [provider.models[0]!],
      }),
    ).toBeNull();
  });
});
