import type { LanguageModelUsage, UIMessage } from 'ai';

import type { MediaStore } from '../../src/media';
import { createAgentTransport } from '../../src/agent/ui/agentTransport';
import {
  AGENT_MODEL_NO_IMAGE_MESSAGE,
  AGENT_NO_MODEL_MESSAGE,
  IMAGE_MESSAGE_TITLE,
} from '../../src/agent/ui/copy';

const mockGetThreadDetail = jest.fn();
const mockGetProvider = jest.fn();
const mockGetProviderKey = jest.fn();
const mockCreateAgentUIStream = jest.fn();
const mockCreateCreateRecordsTool = jest.fn((_deps: unknown) => ({}));
const mockCreateUpdateRecordsTool = jest.fn((_deps: unknown) => ({}));
const mockCreateDeleteRecordsTool = jest.fn((_deps: unknown) => ({}));
const mockCreateAgent = jest.fn((_options: unknown) => ({
  id: 'test-agent',
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

jest.mock('../../src/agent/tools/createRecords', () => ({
  CREATE_RECORDS_TOOL_NAME: 'createRecords',
  createCreateRecordsTool: (deps: unknown) => mockCreateCreateRecordsTool(deps),
}));

jest.mock('../../src/agent/tools/updateRecords', () => ({
  UPDATE_RECORDS_TOOL_NAME: 'updateRecords',
  createUpdateRecordsTool: (deps: unknown) => mockCreateUpdateRecordsTool(deps),
}));

jest.mock('../../src/agent/tools/deleteRecords', () => ({
  DELETE_RECORDS_TOOL_NAME: 'deleteRecords',
  createDeleteRecordsTool: (deps: unknown) => mockCreateDeleteRecordsTool(deps),
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

const AUTO_APPROVE_USER_MESSAGE: UIMessage = {
  ...USER_MESSAGE,
  id: 'user-quick-book',
  metadata: { autoApproveCreate: true },
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

const ATTACHMENT = {
  id: 'att_1',
  ref: 'file:///tmp/quick-book/shot.jpg',
  localPath: 'file:///tmp/quick-book/shot.jpg',
  mediaType: 'image/jpeg',
  filename: 'shot.jpg',
};

function createMediaStoreMock(): MediaStore {
  return {
    scope: { kind: 'local', booksId: 1 },
    save: jest.fn(async () => 'file:///tmp/media.jpg'),
    resolveSource: jest.fn((ref: string) => ({ uri: ref })),
    toRef: jest.fn((uri: string) => uri),
    toDataUrl: jest.fn(async (ref: string) => ref),
  };
}

const ATTACHMENT_MESSAGE: UIMessage = {
  ...IMAGE_MESSAGE,
  id: 'user-image-with-attachment',
  metadata: { attachments: [ATTACHMENT] },
};

const CAPTION_ONLY_MESSAGE: UIMessage = {
  id: 'user-caption-only',
  role: 'user',
  parts: [
    IMAGE_MESSAGE.parts[1]!,
    { type: 'text', text: '【图片附件 att_1：shot.jpg】' },
  ],
  metadata: { attachments: [ATTACHMENT] },
};

function createTransport(
  overrides: {
    media?: MediaStore;
    persistUserMessage?: jest.Mock;
    ensureTitle?: jest.Mock;
    onRecordsChanged?: () => void;
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
  const media = overrides.media ?? createMediaStoreMock();

  const transport = createAgentTransport({
    api: {
      type: {
        getAll: jest.fn(() => Promise.resolve([])),
      },
      tag: { getAll: jest.fn(() => Promise.resolve([])) },
      asset: { getByBook: jest.fn(() => Promise.resolve([])) },
      agent: {
        getThreadDetail: () => mockGetThreadDetail(),
      },
      provider: {
        getById: (...args: unknown[]) => mockGetProvider(...args),
      },
      credential: {
        getKey: (...args: unknown[]) => mockGetProviderKey(...args),
      },
      agentRules: {
        get: jest.fn(() =>
          Promise.resolve({
            booksId: 1,
            agentRules: '',
            quickBookRules: '',
            createdTime: 0,
            updatedTime: 0,
          }),
        ),
      },
    } as never,
    booksId: 1,
    bookName: '测试账本',
    threadId: 1,
    usageRef,
    media,
    persistUserMessage,
    ensureTitle,
    onRecordsChanged: overrides.onRecordsChanged,
  });

  return { transport, media, persistUserMessage, ensureTitle, usageRef };
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

const BASE_PROVIDER = {
  id: 1,
  descriptorId: 'openai-chat',
  name: '测试提供商',
  baseUrl: 'https://api.example.com/v1',
  defaultModelId: 'gpt-5',
  models: [
    {
      modelId: 'gpt-5',
      contextWindow: 32_768,
      reasoningEffort: 'off',
      multimodal: false,
    },
    {
      modelId: 'gpt-5-vision',
      contextWindow: 32_768,
      reasoningEffort: 'off',
      multimodal: true,
    },
    {
      modelId: 'gpt-6-sol',
      contextWindow: 32_768,
      reasoningEffort: 'high',
      multimodal: false,
    },
  ],
  storeResponses: true,
  createdTime: 0,
  updatedTime: 0,
};

function threadDetail(providerId = 1, modelId = 'gpt-5') {
  return {
    thread: {
      id: 1,
      booksId: 1,
      title: '',
      providerId,
      modelId,
      createdTime: 0,
      updatedTime: 0,
    },
    messages: [],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetThreadDetail.mockResolvedValue(threadDetail());
  mockGetProvider.mockResolvedValue(BASE_PROVIDER);
  mockGetProviderKey.mockResolvedValue('api-key');
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
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([IMAGE_MESSAGE]));

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
    };
    expect(options.uiMessages).toEqual([IMAGE_MESSAGE]);
  });

  it('hydrates persisted media refs before sending them to the model', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
    const media = createMediaStoreMock();
    media.toDataUrl = jest.fn(async () => 'data:image/png;base64,REF');
    const { transport } = createTransport({ media });
    const refMessage: UIMessage = {
      id: 'user-media',
      role: 'user',
      parts: [
        {
          type: 'file',
          mediaType: 'image/png',
          filename: 'shot.png',
          url: 'media:abc.png',
        },
      ],
    };

    await transport.sendMessages!(submitRequest([refMessage]));

    const options = mockCreateAgentUIStream.mock.calls[0]![0] as {
      uiMessages: UIMessage[];
    };
    expect(options.uiMessages[0]?.parts[0]).toEqual({
      type: 'file',
      mediaType: 'image/png',
      filename: 'shot.png',
      url: 'data:image/png;base64,REF',
    });
    expect(media.toDataUrl).toHaveBeenCalledWith('media:abc.png');
  });

  it('aborts before streaming when a persisted image cannot be read', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
    const media = createMediaStoreMock();
    media.toDataUrl = jest.fn(async () => {
      throw new Error('图片读取失败（404）');
    });
    const { transport, persistUserMessage } = createTransport({ media });
    const refMessage: UIMessage = {
      id: 'user-media',
      role: 'user',
      parts: [
        {
          type: 'file',
          mediaType: 'image/png',
          filename: 'shot.png',
          url: 'media:abc.png',
        },
      ],
    };

    await expect(
      transport.sendMessages!(submitRequest([refMessage])),
    ).rejects.toThrow('图片读取失败');
    expect(persistUserMessage).not.toHaveBeenCalled();
    expect(mockCreateAgentUIStream).not.toHaveBeenCalled();
  });

  it('uses an image title when the user only sends a picture', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
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

  it('rejects before persisting when the thread has no provider', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(0, ''));
    const { transport, persistUserMessage } = createTransport();

    await expect(
      transport.sendMessages!(submitRequest([USER_MESSAGE])),
    ).rejects.toThrow(AGENT_NO_MODEL_MESSAGE);

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

  it('resolves the model bound to the thread and passes it to the agent', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-6-sol'));
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    expect(mockGetProvider).toHaveBeenCalledWith(1);
    expect(mockGetProviderKey).toHaveBeenCalledWith(1, 1);
    expect(mockCreateAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: BASE_PROVIDER,
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
          createRecords: expect.anything(),
          updateRecords: expect.anything(),
          deleteRecords: expect.anything(),
        }),
        toolApproval: {
          createRecords: {
            type: 'user-approval',
            reason: '将写入账本，请确认',
          },
          updateRecords: {
            type: 'user-approval',
            reason: '将更新账本记录，请确认',
          },
          deleteRecords: {
            type: 'user-approval',
            reason: '将删除账本记录，请确认',
          },
        },
      }),
    );
  });

  it('skips createRecords approval for screenshot quick book batches', async () => {
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([AUTO_APPROVE_USER_MESSAGE]));

    expect(mockCreateAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        toolApproval: {
          updateRecords: {
            type: 'user-approval',
            reason: '将更新账本记录，请确认',
          },
          deleteRecords: {
            type: 'user-approval',
            reason: '将删除账本记录，请确认',
          },
        },
      }),
    );
  });

  it('keeps createRecords approval when only an older message opted out', async () => {
    const latestUser: UIMessage = {
      id: 'user-2',
      role: 'user',
      parts: [{ type: 'text', text: '最近一笔呢？' }],
    };
    const { transport } = createTransport();

    await transport.sendMessages!(
      submitRequest([AUTO_APPROVE_USER_MESSAGE, ASSISTANT_MESSAGE, latestUser]),
    );

    expect(mockCreateAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        toolApproval: expect.objectContaining({
          createRecords: {
            type: 'user-approval',
            reason: '将写入账本，请确认',
          },
        }),
      }),
    );
  });

  it('rejects before persisting when the provider has no model', async () => {
    mockGetProvider.mockResolvedValue({ ...BASE_PROVIDER, models: [] });
    const { transport, persistUserMessage } = createTransport();

    await expect(
      transport.sendMessages!(submitRequest([USER_MESSAGE])),
    ).rejects.toThrow(AGENT_NO_MODEL_MESSAGE);

    expect(persistUserMessage).not.toHaveBeenCalled();
  });

  it('trims history to the selected model context window', async () => {
    mockGetProvider.mockResolvedValue({
      ...BASE_PROVIDER,
      models: [{ ...BASE_PROVIDER.models[0]!, contextWindow: 4_106 }],
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
      'Invalid input for tool createRecords: amount: Expected number, received string';

    expect(options.onError(validationError)).toBe(validationError);
    expect(errorLog).toHaveBeenCalledWith(
      '[agent:tool-call] 工具调用失败',
      validationError,
    );

    const executedError = new Error(
      '工具 createRecords 执行失败：database down',
    );
    expect(options.onError(executedError)).toBe(executedError.message);
    expect(errorLog).toHaveBeenCalledTimes(1);
  });

  it('uses the provider bound to the conversation', async () => {
    const provider = {
      id: 2,
      descriptorId: 'openai-compatible',
      name: '视觉提供商',
      baseUrl: 'https://api.example.com/v1',
      defaultModelId: 'vision',
      models: [
        {
          modelId: 'vision',
          contextWindow: 32_768,
          reasoningEffort: 'off',
          multimodal: true,
        },
      ],
      storeResponses: true,
      createdTime: 0,
      updatedTime: 0,
    };
    mockGetThreadDetail.mockResolvedValue(threadDetail(2, 'vision'));
    mockGetProvider.mockResolvedValue(provider);
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    expect(mockGetProvider).toHaveBeenCalledWith(2);
    expect(mockGetProviderKey).toHaveBeenCalledWith(1, 2);
    const agentOptions = mockCreateAgent.mock.calls[0]![0] as {
      provider: unknown;
    };
    expect(agentOptions.provider).toBe(provider);
  });

  it('passes message attachments to the createRecords tool', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
    const { transport } = createTransport();

    await transport.sendMessages!(submitRequest([ATTACHMENT_MESSAGE]));

    expect(mockCreateCreateRecordsTool).toHaveBeenCalledWith(
      expect.objectContaining({
        attachments: [ATTACHMENT],
      }),
    );
  });

  it('ignores attachment captions when deriving the thread title', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
    const { transport, ensureTitle } = createTransport();

    await transport.sendMessages!(submitRequest([CAPTION_ONLY_MESSAGE]));

    expect(ensureTitle).toHaveBeenCalledWith(IMAGE_MESSAGE_TITLE);
  });

  it('passes the record change notifier to every record write tool', async () => {
    mockGetThreadDetail.mockResolvedValue(threadDetail(1, 'gpt-5-vision'));
    const onRecordsChanged = jest.fn();
    const { transport } = createTransport({ onRecordsChanged });

    await transport.sendMessages!(submitRequest([USER_MESSAGE]));

    expect(mockCreateCreateRecordsTool).toHaveBeenCalledWith(
      expect.objectContaining({ onRecordsChanged }),
    );
    expect(mockCreateUpdateRecordsTool).toHaveBeenCalledWith(
      expect.objectContaining({ onRecordsChanged }),
    );
    expect(mockCreateDeleteRecordsTool).toHaveBeenCalledWith(
      expect.objectContaining({ onRecordsChanged }),
    );
  });
});
