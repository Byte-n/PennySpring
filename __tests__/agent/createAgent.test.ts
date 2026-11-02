import { createAgent } from '../../src/agent/core/createAgent';

const mockAgentSettings: unknown[] = [];

jest.mock('ai', () => ({
  ToolLoopAgent: class {
    constructor(settings: unknown) {
      mockAgentSettings.push(settings);
    }
  },
  stepCountIs: () => 'stop-condition',
}));

jest.mock('../../src/agent/providers/createModel', () => ({
  createProviderModel: () => 'model',
}));

jest.mock('../../src/agent/providers/providerOptions', () => ({
  buildProviderOptions: () => ({}),
}));

describe('createAgent', () => {
  beforeEach(() => {
    mockAgentSettings.length = 0;
  });

  it('forwards the tool approval gate to the agent', () => {
    createAgent({
      provider: { id: 'provider-1', descriptorId: 'openai-responses' } as never,
      model: {
        modelId: 'gpt-5',
        contextWindow: 32_768,
        reasoningEffort: 'off',
        multimodal: false,
      },
      apiKey: 'key',
      systemPrompt: 'system',
      tools: {},
      toolApproval: {
        createRecords: 'user-approval',
      },
    });

    expect(mockAgentSettings[0]).toEqual(
      expect.objectContaining({
        toolApproval: {
          createRecords: 'user-approval',
        },
      }),
    );
  });

  it('maps reasoning effort to the Alibaba provider reasoning setting', () => {
    createAgent({
      provider: { id: 'provider-1', descriptorId: 'dashscope' } as never,
      model: {
        modelId: 'qwen3-max',
        contextWindow: 32_768,
        reasoningEffort: 'high',
        multimodal: false,
      },
      apiKey: 'key',
      systemPrompt: 'system',
      tools: {},
    });

    expect(mockAgentSettings[0]).toEqual(
      expect.objectContaining({ reasoning: 'high' }),
    );
  });

  it('disables Alibaba reasoning explicitly when effort is off', () => {
    createAgent({
      provider: { id: 'provider-1', descriptorId: 'dashscope' } as never,
      model: {
        modelId: 'qwen3-max',
        contextWindow: 32_768,
        reasoningEffort: 'off',
        multimodal: false,
      },
      apiKey: 'key',
      systemPrompt: 'system',
      tools: {},
    });

    expect(mockAgentSettings[0]).toEqual(
      expect.objectContaining({ reasoning: 'none' }),
    );
  });

  it('does not set a reasoning call setting for other providers', () => {
    createAgent({
      provider: { id: 'provider-1', descriptorId: 'openai-responses' } as never,
      model: {
        modelId: 'gpt-5',
        contextWindow: 32_768,
        reasoningEffort: 'high',
        multimodal: false,
      },
      apiKey: 'key',
      systemPrompt: 'system',
      tools: {},
    });

    expect(mockAgentSettings[0]).not.toHaveProperty('reasoning');
  });
});
