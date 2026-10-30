jest.mock('../../src/stores/bookStorage', () => ({
  createSqliteStateStorage: () => ({
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  }),
}));

import {
  getActiveAgentProvider,
  getProviderDisplayName,
  useAgentProviderStore,
} from '../../src/agent/providers/configStore';
import {
  getProviderDescriptor,
  OPENAI_COMPATIBLE_PROVIDER_ID,
  OPENAI_RESPONSES_PROVIDER_ID,
  PROVIDER_DESCRIPTORS,
} from '../../src/agent/providers/catalog';
import {
  DEFAULT_CONTEXT_WINDOW,
  getProviderDefaultModel,
  isMultimodalModel,
  resolveProviderModel,
} from '../../src/agent/providers/models';
import type { AgentProviderConfig } from '../../src/agent/providers/types';

describe('provider catalog', () => {
  it('提供 Responses、Chat 与兼容接口三个描述', () => {
    expect(PROVIDER_DESCRIPTORS.map(item => item.apiKind)).toEqual([
      'responses',
      'chat',
      'openai-compatible',
    ]);
    expect(getProviderDescriptor(OPENAI_RESPONSES_PROVIDER_ID)?.defaultBaseUrl).toBe(
      'https://api.openai.com/v1',
    );
    expect(getProviderDescriptor('missing')).toBeUndefined();
  });
});

describe('agent provider store', () => {
  beforeEach(() => {
    useAgentProviderStore.setState({
      providers: [],
      activeProviderId: null,
    });
  });

  it('新增提供商时规范化模型列表并自动设为当前', () => {
    const provider = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '  我的端点  ',
      baseUrl: ' https://api.example.com/v1/chat/completions/ ',
      defaultModelId: ' deepseek-chat ',
      models: [
        {
          modelId: ' deepseek-chat ',
          contextWindow: 64_000,
          reasoningEffort: 'high',
        },
        { modelId: 'deepseek-chat' },
        { modelId: '   ' },
      ],
    });

    expect(provider.name).toBe('我的端点');
    expect(provider.baseUrl).toBe('https://api.example.com/v1');
    expect(provider.models).toEqual([
      {
        modelId: 'deepseek-chat',
        contextWindow: 64_000,
        reasoningEffort: 'high',
        multimodal: false,
      },
    ]);
    expect(provider.defaultModelId).toBe('deepseek-chat');
    expect(useAgentProviderStore.getState().activeProviderId).toBe(provider.id);
    expect(getActiveAgentProvider()?.id).toBe(provider.id);
    expect(getProviderDisplayName(provider)).toBe('我的端点');
  });

  it('默认模型不存在时回退到第一个模型，并补齐模型默认参数', () => {
    const provider = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.openai.com/v1',
      defaultModelId: 'missing-model',
      models: [{ modelId: 'gpt-5.1' }, { modelId: 'gpt-6-sol' }],
    });

    expect(provider.defaultModelId).toBe('gpt-5.1');
    expect(provider.models[0]).toEqual({
      modelId: 'gpt-5.1',
      contextWindow: DEFAULT_CONTEXT_WINDOW,
      reasoningEffort: 'off',
      multimodal: false,
    });
  });

  it('保留模型的多模态标记并默认关闭', () => {
    const provider = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.example.com/v1',
      models: [
        { modelId: 'vision-model', multimodal: true },
        { modelId: 'text-model' },
      ],
    });

    expect(provider.models.map(model => model.multimodal)).toEqual([
      true,
      false,
    ]);
    expect(isMultimodalModel(provider.models[0])).toBe(true);
    expect(isMultimodalModel(provider.models[1])).toBe(false);
    expect(isMultimodalModel(null)).toBe(false);
  });

  it('服务端存储默认开启，并保留草稿中的关闭选择', () => {
    const defaulted = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.openai.com/v1',
      models: [{ modelId: 'gpt-5' }],
    });
    const disabled = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '中转',
      baseUrl: 'https://gateway.example.com/v1',
      models: [{ modelId: 'gpt-6-sol' }],
      storeResponses: false,
    });

    expect(defaulted.storeResponses).toBe(true);
    expect(disabled.storeResponses).toBe(false);
  });

  it('更新与删除提供商时保持当前选择有效', () => {
    const first = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.openai.com/v1',
      models: [{ modelId: 'gpt-5' }],
    });
    const second = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.example.com/v1',
      models: [{ modelId: 'model-b' }],
      defaultModelId: 'model-b',
    });

    useAgentProviderStore.getState().updateProvider(second.id, {
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '备用',
      baseUrl: 'https://api.example.com/v1/',
      models: [{ modelId: 'model-c' }, { modelId: 'model-d' }],
      defaultModelId: 'model-d',
    });

    const updated = useAgentProviderStore
      .getState()
      .providers.find(item => item.id === second.id);
    expect(updated?.name).toBe('备用');
    expect(updated?.models.map(model => model.modelId)).toEqual([
      'model-c',
      'model-d',
    ]);
    expect(updated?.defaultModelId).toBe('model-d');

    useAgentProviderStore.getState().removeProvider(second.id);
    expect(useAgentProviderStore.getState().activeProviderId).toBe(first.id);
    expect(useAgentProviderStore.getState().providers).toHaveLength(1);
  });

  it('拒绝未知描述类型', () => {
    expect(() =>
      useAgentProviderStore.getState().addProvider({
        descriptorId: 'unknown',
        name: '',
        baseUrl: 'https://api.example.com/v1',
        models: [{ modelId: 'x' }],
      }),
    ).toThrow('不支持的提供商类型');
  });
});

describe('provider model resolution', () => {
  const provider: AgentProviderConfig = {
    id: 'provider_1',
    descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
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
        multimodal: true,
      },
    ],
    storeResponses: true,
    createdAt: 0,
    updatedAt: 0,
  };

  it('优先返回指定模型', () => {
    expect(resolveProviderModel(provider, 'model-a')?.modelId).toBe('model-a');
  });

  it('指定模型不存在时回退到默认模型', () => {
    expect(resolveProviderModel(provider, 'missing')?.modelId).toBe('model-b');
    expect(getProviderDefaultModel(provider)?.modelId).toBe('model-b');
  });

  it('默认模型缺失时回退到第一个模型', () => {
    const withoutDefault = { ...provider, defaultModelId: 'missing' };
    expect(getProviderDefaultModel(withoutDefault)?.modelId).toBe('model-a');
  });
});
