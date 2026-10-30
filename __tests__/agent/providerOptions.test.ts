import {
  OPENAI_CHAT_PROVIDER_ID,
  OPENAI_COMPATIBLE_PROVIDER_ID,
  OPENAI_RESPONSES_PROVIDER_ID,
} from '../../src/agent/providers/catalog';
import { buildProviderOptions } from '../../src/agent/providers/providerOptions';
import type {
  AgentModelConfig,
  AgentProviderConfig,
  AgentReasoningEffort,
} from '../../src/agent/providers/types';

function createConfig(
  descriptorId: string,
  storeResponses: boolean,
): AgentProviderConfig {
  return {
    id: 'provider_1',
    descriptorId,
    name: '测试提供商',
    baseUrl: 'https://host/v1',
    defaultModelId: 'gpt-5',
    models: [],
    storeResponses,
    createdAt: 0,
    updatedAt: 0,
  };
}

function createModel(
  reasoningEffort: AgentReasoningEffort,
): AgentModelConfig {
  return {
    modelId: 'gpt-5',
    contextWindow: 32_768,
    reasoningEffort,
    multimodal: false,
  };
}

describe('buildProviderOptions', () => {
  it('Responses 关闭服务端存储且思考关闭时只传 store:false', () => {
    expect(
      buildProviderOptions(
        createConfig(OPENAI_RESPONSES_PROVIDER_ID, false),
        createModel('off'),
      ),
    ).toEqual({ openai: { store: false } });
  });

  it('Responses 保持服务端存储且思考关闭时不覆盖 SDK 默认值', () => {
    expect(
      buildProviderOptions(
        createConfig(OPENAI_RESPONSES_PROVIDER_ID, true),
        createModel('off'),
      ),
    ).toBeUndefined();
  });

  it('Responses 传入思考强度', () => {
    expect(
      buildProviderOptions(
        createConfig(OPENAI_RESPONSES_PROVIDER_ID, true),
        createModel('medium'),
      ),
    ).toEqual({ openai: { reasoningEffort: 'medium' } });
  });

  it('Chat 传入思考强度且不受服务端存储开关影响', () => {
    expect(
      buildProviderOptions(
        createConfig(OPENAI_CHAT_PROVIDER_ID, false),
        createModel('high'),
      ),
    ).toEqual({ openai: { reasoningEffort: 'high' } });
  });

  it('兼容接口使用 openaiCompatible 命名空间', () => {
    expect(
      buildProviderOptions(
        createConfig(OPENAI_COMPATIBLE_PROVIDER_ID, false),
        createModel('low'),
      ),
    ).toEqual({ openaiCompatible: { reasoningEffort: 'low' } });
  });

  it('思考关闭时不向兼容接口下发参数', () => {
    expect(
      buildProviderOptions(
        createConfig(OPENAI_COMPATIBLE_PROVIDER_ID, false),
        createModel('off'),
      ),
    ).toBeUndefined();
  });
});
