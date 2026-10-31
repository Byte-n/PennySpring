import {
  DASHSCOPE_PROVIDER_ID,
  getProviderDescriptor,
  OPENAI_COMPATIBLE_PROVIDER_ID,
  OPENAI_RESPONSES_PROVIDER_ID,
  PROVIDER_DESCRIPTORS,
} from '../../src/agent/providers/catalog';
import {
  getProviderDefaultModel,
  resolveProviderModel,
} from '../../src/agent/providers/models';
import type { AgentProviderConfig } from '../../src/agent/providers/types';

describe('provider catalog', () => {
  it('提供 Responses、Chat、百炼与兼容接口四个描述', () => {
    expect(PROVIDER_DESCRIPTORS.map(item => item.apiKind)).toEqual([
      'responses',
      'chat',
      'alibaba',
      'openai-compatible',
    ]);
    expect(getProviderDescriptor(OPENAI_RESPONSES_PROVIDER_ID)?.defaultBaseUrl).toBe(
      'https://api.openai.com/v1',
    );
    expect(getProviderDescriptor(DASHSCOPE_PROVIDER_ID)?.defaultBaseUrl).toBe(
      'https://dashscope.aliyuncs.com/compatible-mode/v1',
    );
    expect(getProviderDescriptor('missing')).toBeUndefined();
  });
});

describe('provider model resolution', () => {
  const provider: AgentProviderConfig = {
    id: 1,
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
    createdTime: 0,
    updatedTime: 0,
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
