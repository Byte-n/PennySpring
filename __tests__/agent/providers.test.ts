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

  it('新增提供商时规范化字段并自动设为当前', () => {
    const provider = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '  我的端点  ',
      baseUrl: ' https://api.example.com/v1/chat/completions/ ',
      model: '  deepseek-chat ',
    });

    expect(provider.name).toBe('我的端点');
    expect(provider.baseUrl).toBe('https://api.example.com/v1');
    expect(provider.model).toBe('deepseek-chat');
    expect(useAgentProviderStore.getState().activeProviderId).toBe(provider.id);
    expect(getActiveAgentProvider()?.id).toBe(provider.id);
    expect(getProviderDisplayName(provider)).toBe('我的端点');
  });

  it('服务端存储默认开启，并保留草稿中的关闭选择', () => {
    const defaulted = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-5',
    });
    const disabled = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '中转',
      baseUrl: 'https://gateway.example.com/v1',
      model: 'gpt-6-sol',
      storeResponses: false,
    });

    expect(defaulted.storeResponses).toBe(true);
    expect(disabled.storeResponses).toBe(false);
  });

  it('迁移旧配置时把缺失的服务端存储开关补为开启', () => {
    const migrate = useAgentProviderStore.persist.getOptions().migrate as
      | ((state: unknown, version: number) => unknown)
      | undefined;
    expect(migrate).toBeDefined();

    const migrated = migrate?.(
      {
        providers: [
          {
            id: 'provider_legacy',
            descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
            name: '旧配置',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-5',
            createdAt: 0,
            updatedAt: 0,
          },
        ],
        activeProviderId: 'provider_legacy',
      },
      1,
    ) as { providers: Array<{ storeResponses?: boolean }> };

    expect(migrated.providers[0]?.storeResponses).toBe(true);
  });

  it('更新与删除提供商时保持当前选择有效', () => {
    const first = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_RESPONSES_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-5',
    });
    const second = useAgentProviderStore.getState().addProvider({
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '',
      baseUrl: 'https://api.example.com/v1',
      model: 'model-b',
    });

    useAgentProviderStore.getState().updateProvider(second.id, {
      descriptorId: OPENAI_COMPATIBLE_PROVIDER_ID,
      name: '备用',
      baseUrl: 'https://api.example.com/v1/',
      model: 'model-c',
    });

    const updated = useAgentProviderStore
      .getState()
      .providers.find(item => item.id === second.id);
    expect(updated?.name).toBe('备用');
    expect(updated?.model).toBe('model-c');

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
        model: 'x',
      }),
    ).toThrow('不支持的提供商类型');
  });
});
