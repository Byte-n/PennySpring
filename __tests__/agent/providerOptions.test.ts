import {
  OPENAI_CHAT_PROVIDER_ID,
  OPENAI_COMPATIBLE_PROVIDER_ID,
  OPENAI_RESPONSES_PROVIDER_ID,
} from '../../src/agent/providers/catalog';
import { buildProviderOptions } from '../../src/agent/providers/providerOptions';
import type { AgentProviderConfig } from '../../src/agent/providers/types';

function createConfig(
  descriptorId: string,
  storeResponses: boolean,
): AgentProviderConfig {
  return {
    id: 'provider_1',
    descriptorId,
    name: '测试提供商',
    baseUrl: 'https://host/v1',
    model: 'gpt-5',
    storeResponses,
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('buildProviderOptions', () => {
  it('Responses 关闭服务端存储时传 store:false', () => {
    expect(
      buildProviderOptions(createConfig(OPENAI_RESPONSES_PROVIDER_ID, false)),
    ).toEqual({ openai: { store: false } });
  });

  it('Responses 保持服务端存储时不覆盖 SDK 默认值', () => {
    expect(
      buildProviderOptions(createConfig(OPENAI_RESPONSES_PROVIDER_ID, true)),
    ).toBeUndefined();
  });

  it('Chat 与兼容接口不受该开关影响', () => {
    expect(
      buildProviderOptions(createConfig(OPENAI_CHAT_PROVIDER_ID, false)),
    ).toBeUndefined();
    expect(
      buildProviderOptions(createConfig(OPENAI_COMPATIBLE_PROVIDER_ID, false)),
    ).toBeUndefined();
  });
});
