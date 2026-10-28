import type { LanguageModelUsage, UIMessage } from 'ai';

import { createAgentTransport } from '../../src/agent/ui/agentTransport';
import { AGENT_NOT_CONFIGURED_MESSAGE } from '../../src/agent/ui/copy';

const mockGetActiveAgentProvider = jest.fn();
const mockLoadProviderApiKey = jest.fn();
const mockCreateAgentUIStream = jest.fn();

jest.mock('../../src/agent/providers/configStore', () => ({
  getActiveAgentProvider: () => mockGetActiveAgentProvider(),
}));

jest.mock('../../src/agent/providers/secureKey', () => ({
  loadProviderApiKey: (...args: unknown[]) => mockLoadProviderApiKey(...args),
}));

jest.mock('../../src/agent/projection/context', () => ({
  buildSystemPrompt: () => 'system prompt',
}));

jest.mock('../../src/agent/tools/queryRecords', () => ({
  createQueryRecordsTool: () => ({}),
}));

jest.mock('../../src/agent/core/createAgent', () => ({
  createAgent: () => ({ id: 'test-agent' }),
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

function createTransport(overrides: {
  persistUserMessage?: jest.Mock;
  ensureTitle?: jest.Mock;
  usageRef?: { current: { promptTokens: number; completionTokens: number; totalTokens: number } };
} = {}) {
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
  mockLoadProviderApiKey.mockResolvedValue('api-key');
  mockCreateAgentUIStream.mockResolvedValue(new ReadableStream());
});

describe('createAgentTransport', () => {
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
    expect(options.sendReasoning).toBe(false);
    expect(options.sendSources).toBe(false);
    expect(options.timeout).toEqual({ totalMs: 120_000, chunkMs: 60_000 });
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
});
