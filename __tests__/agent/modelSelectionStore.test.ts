jest.mock('../../src/stores/bookStorage', () => ({
  createSqliteStateStorage: () => ({
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  }),
}));

import {
  clearThreadModel,
  getThreadModelSelection,
  rememberThreadModel,
  resolveThreadModel,
  useThreadModelStore,
} from '../../src/agent/providers/modelSelectionStore';
import type { AgentProviderConfig } from '../../src/agent/providers/types';

const provider: AgentProviderConfig = {
  id: 'provider_1',
  descriptorId: 'openai-compatible',
  name: '测试',
  baseUrl: 'https://api.example.com/v1',
  defaultModelId: 'model-b',
  models: [
    {
      modelId: 'model-a',
      contextWindow: 32_768,
      reasoningEffort: 'low',
      multimodal: false,
    },
    {
      modelId: 'model-b',
      contextWindow: 128_000,
      reasoningEffort: 'medium',
      multimodal: false,
    },
  ],
  storeResponses: true,
  createdAt: 0,
  updatedAt: 0,
};

beforeEach(() => {
  useThreadModelStore.setState({ selections: {} });
});

describe('thread model selection', () => {
  it('remembers the model per conversation', () => {
    rememberThreadModel(1, provider.id, 'model-a');
    rememberThreadModel(2, provider.id, 'model-b');

    expect(getThreadModelSelection(1)).toEqual({
      providerId: provider.id,
      modelId: 'model-a',
    });
    expect(getThreadModelSelection(2)?.modelId).toBe('model-b');
  });

  it('resolves the remembered model for the same provider', () => {
    rememberThreadModel(1, provider.id, 'model-a');

    expect(resolveThreadModel(provider, 1)?.modelId).toBe('model-a');
  });

  it('falls back to the default model when the provider changed', () => {
    rememberThreadModel(1, 'other-provider', 'model-a');

    expect(resolveThreadModel(provider, 1)?.modelId).toBe('model-b');
  });

  it('falls back to the default model when the remembered model was removed', () => {
    rememberThreadModel(1, provider.id, 'removed-model');

    expect(resolveThreadModel(provider, 1)?.modelId).toBe('model-b');
  });

  it('uses the default model for a conversation without history', () => {
    expect(resolveThreadModel(provider, 99)?.modelId).toBe('model-b');
  });

  it('clears the selection when a conversation is deleted', () => {
    rememberThreadModel(1, provider.id, 'model-a');

    clearThreadModel(1);

    expect(getThreadModelSelection(1)).toBeNull();
  });
});
