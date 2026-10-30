import type { LanguageModelUsage, UIMessage } from 'ai';

import { createAgentTransport } from '../../src/agent/ui/agentTransport';
import {
  AGENT_MODEL_NO_IMAGE_MESSAGE,
  AGENT_NOT_CONFIGURED_MESSAGE,
  AGENT_NO_MODEL_MESSAGE,
  IMAGE_MESSAGE_TITLE,
} from '../../src/agent/ui/copy';

const mockGetActiveAgentProvider = jest.fn();
const mockLoadProviderApiKey = jest.fn();
const mockCreateAgentUIStream = jest.fn();
const mockResolveThreadModel = jest.fn();
const mockRememberThreadModel = jest.fn();
const mockCreateAgent = jest.fn((_options: unknown) => ({
  id: 'test-agent',
}));

jest.mock('../../src/agent/providers/configStore', () => ({
  getActiveAgentProvider: () => mockGetActiveAgentProvider(),
}));

jest.mock('../../src/agent/providers/modelSelectionStore', () => ({
  resolveThreadModel: (...args: unknown[]) => mockResolveThreadModel(...args),
  rememberThreadModel: (
    threadId: number,
    providerId: string,
    modelId: string,
  ) => mockRememberThreadModel(threadId, providerId, modelId),
}));

jest.mock('../../src/agent/providers/secureKey', () => ({
  loadProviderApiKey: (...args: unknown[]) => mockLoadProviderApiKey(...args),
}));

jest.mock('../../src/agent/projection/context', () => ({
  buildSystemPrompt: () => 'system prompt',
}));

jest.mock('../../src/agent/tools/queryRecords', () => ({
  QUERY_RECORDS_TOOL_NAME: 'queryRecords',
  createQueryRecordsTool: () => ({}),
}));

jest.mock('../../src/agent/tools/listTypes', () => ({
  LIST_TYPES_TOOL_NAME: 'listTypes',
  createListTypesTool: () => ({}),
}));

jest.mock('../../src/agent/tools/listTags', () => ({
  LIST_TAGS_TOOL_NAME: 'listTags',
  createListTagsTool: () => ({}),
}));

jest.mock('../../src/agent/tools/listAssets', () => ({
  LIST_ASSETS_TOOL_NAME: 'listAssets',
  createListAssetsTool: () => ({}),
}));

jest.mock('../../src/agent/tools/createRecord', () => ({
  CREATE_RECORD_TOOL_NAME: 'createRecord',
  createCreateRecordTool: () => ({}),
}));

jest.mock('../../src/agent/core/createAgent', () => ({
  createAgent: (options: unknown) => mockCreateAgent(options),
}));

jest.mock('ai', () => ({
  createAgentUIStream: (...args: unknown[]) => mockCreateAgentUIStream(...args),
}));

const USER_MESSAGE: UIMessage = {
  id: 'user-1',
  role: 'user',
  parts: [{ type: 'text', text: '上个月吃饭花了多少？' }],
};

const ASSISTANT_MESSAGE: UIMessage = {
  id: 'assistant-1',
  role: 'assistant',
  parts: [{ type: 'text', text: '共 120 元。' }],
};

const ASSISTANT_REASONING_MESSAGE: UIMessage = {
  id: 'assistant-reasoning',
  role: 'assistant',
  parts: [
    { type: 'reasoning', text: '先核对类型和资产。', state: 'done' },
    { type: 'text', text: '共 120 元。' },
  ],
};

const IMAGE_MESSAGE: UIMessage = {
  id: 'user-image',
  role: 'user',
  parts: [
    { type: 'text', text: '看看这张小票' },
    {
      type: 'file',
      mediaType: 'image/jpeg',
      filename: 'receipt.jpg',
      url: 'data:image/jpeg;base64,QUJD',
    },
  ],
};

function createTransport(
  overrides: {
    persistUserMessage?: jest.Mock;
    ensureTitle?: jest.Mock;
    usageRef?: {
      current: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };
  } = {},
) {
  const persistUserMessage =
    overrides.persistUserMessage ?? jest.fn(() => Promise.resolve());
  const ensureTitle = overrides.ensureTitle ?? jest.fn(() => Promise.resolve());
  const usageRef = overrides.usageRef ?? {
    current: { promptTokens: 99, completionTokens: 99, totalTokens: 198 },
  };

  const transport = createAgentTransport({
    api: {
      type: {
        getAll: jest.fn(() => Promise.resolve([])),
      },
    } as never,
    booksId: 1,
    bookName: '测试账本',
    threadId: 1,
    usageRef,
    persistUserMessage,
    ensureTitle,
  });

  return { transport, persistUserMessage, ensureTitle, usageRef };
}

function submitRequest(messages: UIMessage[]) {
  return {
    trigger: 'submit-message' as const,
    chatId: 'thread-1',
    messageId: undefined,
    messages,
    abortSignal: new AbortController().signal,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetActiveAgentProvider.mockReturnValue({
    id: 'provider-1',
  });
  mockResolveThreadModel.mockReturnValue({
    modelId: 'gpt-5',
    contextWindow: 32_768,
    reasoningEffort: 'off',
    multimodal: false,
  });
  mockLoadProviderApiKey.mockResolvedValue('api-key');
  mockCreateAgentUIStream.mockResolvedValue(new ReadableStream());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('createAgentTransport', () => {
  it('rejects image messages when the selected model is not multimodal', async () => {
    const { transport, persistUserMessage } = createTransport();

    await expect(
      transport.sendMessages!(submitRequest([IMAGE_MESSAGE])),
    ).rejects.toThrow(AGENT_MODEL_NO_IMAGE_MESSAGE);

    expect(persistUserMessage).not.toHaveBeenCalled();
    expect(mockCreateAgentUIStream).not.toHaveBeenCalled();
  });

  it('keeps image parts when the selected model is multimodal', async () => {
    mockResolveThreadModel.mockReturnValue({
      modelId: 'gpt-5-vision',
      contextWindow: 32_768,
      reasoningEffort: 'off',
      multimodal: true,
    });
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([IMAGE_MESSAGE]));

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
    };
    expect(options.uiMessages).toEqual([IMAGE_MESSAGE]);
  });

  it('uses an image title when the user only sends a picture', async () => {
    mockResolveThreadModel.mockReturnValue({
      modelId: 'gpt-5-vision',
      contextWindow: 32_768,
      reasoningEffort: 'off',
      multimodal: true,
    });
    const imageOnly: UIMessage = {
      id: 'user-image-only',
      role: 'user',
      parts: [
        {
          type: 'file',
          mediaType: 'image/jpeg',
          filename: 'receipt.jpg',
          url: 'data:image/jpeg;base64,QUJD',
        },
      ],
    };
    const { transport, ensureTitle } = createTransport();

    await transport.sendMessages!(submitRequest([imageOnly]));

    expect(ensureTitle).toHaveBeenCalledWith(IMAGE_MESSAGE_TITLE);
  });

  it('keeps reasoning parts in the conversation history', async () => {
    const latestUser: UIMessage = {
      id: 'user-2',
      role: 'user',
      parts: [{ type: 'text', text: '最近一笔呢？' }],
    };
    const { transport } = createTransport();

    await transport.sendMessages!(
      submitRequest([USER_MESSAGE, ASSISTANT_REASONING_MESSAGE, latestUser]),
    );

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
    };
    expect(options.uiMessages).toEqual([
      USER_MESSAGE,
      ASSISTANT_REASONING_MESSAGE,
      latestUser,
    ]);
  });

  it('strips historical images when the selected model is not multimodal', async () => {
    const latestUser: UIMessage = {
      id: 'user-2',
      role: 'user',
      parts: [{ type: 'text', text: '最近一笔呢？' }],
    };
    const { transport } = createTransport();

    await transport.sendMessages!(
      submitRequest([IMAGE_MESSAGE, ASSISTANT_MESSAGE, latestUser]),
    );

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
    };
    expect(options.uiMessages).toEqual([
      {
        ...IMAGE_MESSAGE,
        parts: [{ type: 'text', text: '看看这张小票' }],
      },
      ASSISTANT_MESSAGE,
      latestUser,
    ]);
  });

  it('rejects before persisting when no provider is configured', async () => {
    mockGetActiveAgentProvider.mockReturnValue(null);
    const { transport, persistUserMessage } = createTransport();

    await expect(
      transport.sendMessages!(submitRequest([USER_MESSAGE])),
    ).rejects.toThrow(AGENT_NOT_CONFIGURED_MESSAGE);

    expect(persistUserMessage).not.toHaveBeenCalled();
  });

  it('persists the user message and title before running the agent', async () => {
    const { transport, persistUserMessage, ensureTitle } = createTransport();

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    expect(persistUserMessage).toHaveBeenCalledWith(USER_MESSAGE);
    expect(ensureTitle).toHaveBeenCalledWith('上个月吃饭花了多少？');
    expect(mockCreateAgentUIStream).toHaveBeenCalledTimes(1);

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
      sendReasoning: boolean;
      sendSources: boolean;
      timeout: { totalMs: number; chunkMs: number };
    };
    expect(options.uiMessages).toEqual([USER_MESSAGE]);
    expect(options.sendReasoning).toBe(true);
    expect(options.sendSources).toBe(false);
    expect(options.timeout).toEqual({ totalMs: 120_000, chunkMs: 60_000 });
  });

  it('resolves the conversation model, remembers it and passes it to the agent', async () => {
    mockResolveThreadModel.mockReturnValue({
      modelId: 'gpt-6-sol',
      contextWindow: 32_768,
      reasoningEffort: 'high',
    });
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    expect(mockResolveThreadModel).toHaveBeenCalledWith(
      { id: 'provider-1' },
      1,
    );
    expect(mockRememberThreadModel).toHaveBeenCalledWith(
      1,
      'provider-1',
      'gpt-6-sol',
    );
    expect(mockCreateAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: { id: 'provider-1' },
        model: expect.objectContaining({ modelId: 'gpt-6-sol' }),
        apiKey: 'api-key',
      }),
    );
  });

  it('passes metadata and write tools with a user approval gate to the agent', async () => {
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    expect(mockCreateAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          queryRecords: expect.anything(),
          listTypes: expect.anything(),
          listTags: expect.anything(),
          listAssets: expect.anything(),
          createRecord: expect.anything(),
        }),
        toolApproval: {
          createRecord: {
            type: 'user-approval',
            reason: '将写入账本，请确认',
          },
        },
      }),
    );
  });

  it('rejects before persisting when the provider has no model', async () => {
    mockResolveThreadModel.mockReturnValue(null);
    const { transport, persistUserMessage } = createTransport();

    await expect(
      transport.sendMessages!(submitRequest([USER_MESSAGE])),
    ).rejects.toThrow(AGENT_NO_MODEL_MESSAGE);

    expect(persistUserMessage).not.toHaveBeenCalled();
    expect(mockRememberThreadModel).not.toHaveBeenCalled();
  });

  it('trims history to the selected model context window', async () => {
    mockResolveThreadModel.mockReturnValue({
      modelId: 'gpt-5',
      contextWindow: 4_106,
      reasoningEffort: 'off',
    });
    const { transport } = createTransport();
    const latestUserMessage: UIMessage = {
      id: 'user-2',
      role: 'user',
      parts: [{ type: 'text', text: '最近一笔呢？' }],
    };
    const messages = [USER_MESSAGE, ASSISTANT_MESSAGE, latestUserMessage];

    await transport.sendMessages!(submitRequest(messages));

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
    };
    expect(options.uiMessages).toEqual([latestUserMessage]);
  });

  it('does not persist again when regenerating a response', async () => {
    const { transport, persistUserMessage, ensureTitle } = createTransport();

    await transport.sendMessages!({
      ...submitRequest([USER_MESSAGE, ASSISTANT_MESSAGE]),
      trigger: 'regenerate-message',
      messageId: ASSISTANT_MESSAGE.id,
    });

    expect(persistUserMessage).not.toHaveBeenCalled();
    expect(ensureTitle).not.toHaveBeenCalled();
  });

  it('accumulates usage from every completed step', async () => {
    const { transport, usageRef } = createTransport();

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      onStepEnd?: (step: { usage: LanguageModelUsage }) => void;
    };
    options.onStepEnd?.({
      usage: {
        inputTokens: 10,
        outputTokens: 4,
        totalTokens: 14,
      } as LanguageModelUsage,
    });
    options.onStepEnd?.({
      usage: {
        inputTokens: 2,
        outputTokens: 1,
        totalTokens: 3,
      } as LanguageModelUsage,
    });

    expect(usageRef.current).toEqual({
      promptTokens: 12,
      completionTokens: 5,
      totalTokens: 17,
    });
  });

  it('logs SDK validation errors and forwards their real text', async () => {
    const { transport } = createTransport();
    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      onError: (error: unknown) => string;
    };
    const errorLog = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const validationError =
      'Invalid input for tool createRecord: amount: Expected number, received string';

    expect(options.onError(validationError)).toBe(validationError);
    expect(errorLog).toHaveBeenCalledWith(
      '[agent:tool-call] 工具调用失败',
      validationError,
    );

    const executedError = new Error('工具 createRecord 执行失败：database down');
    expect(options.onError(executedError)).toBe(executedError.message);
    expect(errorLog).toHaveBeenCalledTimes(1);
  });
});
