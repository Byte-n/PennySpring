jest.mock('react-native-file-access', () => ({
  FileSystem: { readFile: jest.fn(async () => 'aW1hZ2U=') },
}));

jest.mock('../../src/features/quickBook/validation', () => ({
  resolveQuickBookModel: jest.fn(),
}));

jest.mock('../../src/agent/core/agentRules', () => ({
  loadBookAgentRules: jest.fn(async () => undefined),
}));

jest.mock('../../src/agent/core/createAgent', () => ({
  createAgent: jest.fn(),
}));

jest.mock('../../src/agent/tools/saveRecordDrafts', () => ({
  createQuickBookDraftTools: jest.fn(() => ({})),
}));

jest.mock('../../src/agent/projection/quickBookDraftContext', () => ({
  buildQuickBookDraftSystemPrompt: jest.fn(() => 'system'),
  buildQuickBookDraftUserMessage: jest.fn(() => 'user'),
}));

jest.mock('../../src/features/quickBookDraft/bookApi', () => ({
  resolveBookApi: jest.fn(),
  resolveBookMedia: jest.fn(async () => null),
}));

jest.mock('../../src/features/quickBookDraft/draftCacheStorage', () => ({
  quickBookDraftCache: {
    createPlaceholder: jest.fn(),
    setAgent: jest.fn(),
    getById: jest.fn(),
    markReady: jest.fn(),
    markFailed: jest.fn(),
  },
}));

jest.mock('../../src/features/quickBookDraft/native', () => ({
  ackQuickBookDraftJob: jest.fn(async () => undefined),
  reportQuickBookDraftOutcome: jest.fn(async () => undefined),
}));

import type { AgentProviderModel, AgentSelection } from '@pennyspring/api';

import { createAgent } from '../../src/agent/core/createAgent';
import {
  QUICK_BOOK_DRAFT_RUN_TIMEOUT_MS,
  runQuickBookDraft,
} from '../../src/agent/headless/runQuickBookDraft';
import { resolveQuickBookModel } from '../../src/features/quickBook/validation';
import { resolveBookApi } from '../../src/features/quickBookDraft/bookApi';
import type { DraftBookTarget } from '../../src/features/quickBookDraft/draftBook';
import { quickBookDraftCache } from '../../src/features/quickBookDraft/draftCacheStorage';
import {
  useQuickBookDraftProgressStore,
  type QuickBookDraftProgress,
} from '../../src/features/quickBookDraft/draftProgress';
import { ackQuickBookDraftJob } from '../../src/features/quickBookDraft/native';
import { useDraftVersionStore } from '../../src/stores/draftVersionStore';

const mockedAckQuickBookDraftJob = ackQuickBookDraftJob as jest.Mock;

const mockBookApi = {
  book: { getById: jest.fn() },
  provider: { getAll: jest.fn() },
  quickBook: { getSelection: jest.fn() },
  credential: { getKey: jest.fn() },
};

const mockDraftCache = quickBookDraftCache as unknown as {
  createPlaceholder: jest.Mock;
  setAgent: jest.Mock;
  getById: jest.Mock;
  markReady: jest.Mock;
  markFailed: jest.Mock;
};

const TARGET: DraftBookTarget = {
  kind: 'local',
  serverUrl: '',
  booksId: 3,
  bookName: '草稿账本',
};

const INPUT = {
  draftId: 'draft-1',
  imagePath: '/tmp/share.jpg',
  target: TARGET,
};

const SELECTION: AgentSelection = {
  providerId: 7,
  modelId: 'vision-model',
};

const PROVIDER = {
  id: 7,
  descriptorId: 'openai',
  name: '提供商',
  baseUrl: 'https://example.com',
  defaultModelId: 'vision-model',
  models: [],
  storeResponses: false,
  createdTime: 0,
  updatedTime: 0,
};

const MODEL: AgentProviderModel = {
  modelId: 'vision-model',
  contextWindow: 128_000,
  reasoningEffort: 'medium',
  multimodal: true,
};

let order: string[];

async function* streamOf(
  parts: readonly Record<string, unknown>[],
): AsyncGenerator<Record<string, unknown>> {
  for (const part of parts) {
    yield part;
  }
}

beforeEach(() => {
  order = [];
  jest.clearAllMocks();
  useQuickBookDraftProgressStore.setState({ progressById: {} });
  (resolveBookApi as jest.Mock).mockResolvedValue(mockBookApi as never);
  mockDraftCache.createPlaceholder.mockImplementation(async () => {
    order.push('placeholder');
    return { status: 'generating', items: [] };
  });
  mockDraftCache.setAgent.mockResolvedValue({ status: 'generating' });
  mockDraftCache.getById.mockResolvedValue({
    status: 'generating',
    items: [{ status: 'pending' }],
  });
  mockDraftCache.markReady.mockImplementation(async () => {
    order.push('ready');
    return { status: 'pending' };
  });
  mockDraftCache.markFailed.mockResolvedValue(undefined);
  mockBookApi.book.getById.mockResolvedValue({ id: 3, name: '草稿账本' });
  mockBookApi.provider.getAll.mockResolvedValue([PROVIDER]);
  mockBookApi.quickBook.getSelection.mockImplementation(async () => {
    order.push('resolve');
    return SELECTION;
  });
  mockBookApi.credential.getKey.mockResolvedValue('api-key');
  (resolveQuickBookModel as jest.Mock).mockReturnValue({
    ok: true,
    provider: PROVIDER,
    model: MODEL,
  });
  (createAgent as jest.Mock).mockImplementation(() => ({
    stream: jest.fn(async () => {
      order.push('stream');
      return { fullStream: streamOf([]) };
    }),
  }));
});

describe('runQuickBookDraft lifecycle', () => {
  it('creates the placeholder before model resolution and marks ready after generation', async () => {
    await runQuickBookDraft(INPUT);

    expect(order).toEqual(['placeholder', 'resolve', 'stream', 'ready']);
    expect(mockDraftCache.markReady).toHaveBeenCalledWith(INPUT.draftId);
  });

  it('records the provider and model as soon as model resolution succeeds', async () => {
    await runQuickBookDraft(INPUT);

    expect(mockDraftCache.setAgent).toHaveBeenCalledWith(INPUT.draftId, {
      agentProviderId: 7,
      agentModelId: 'vision-model',
    });
  });

  it('bumps the draft version when analysis starts and when it finishes', async () => {
    const before = useDraftVersionStore.getState().draftVersion;

    await runQuickBookDraft(INPUT);

    expect(useDraftVersionStore.getState().draftVersion).toBe(before + 2);
  });

  it('keeps a visible failed draft when model resolution fails', async () => {
    (resolveQuickBookModel as jest.Mock).mockReturnValue({
      ok: false,
      reason: 'provider-missing',
    });
    const before = useDraftVersionStore.getState().draftVersion;

    await expect(runQuickBookDraft(INPUT)).rejects.toThrow(
      '请先在 AI 记账设置中选择 AI 提供商。',
    );

    expect(order[0]).toBe('placeholder');
    expect(mockDraftCache.markFailed).toHaveBeenCalledWith(
      INPUT.draftId,
      '请先在 AI 记账设置中选择 AI 提供商。',
    );
    expect(useDraftVersionStore.getState().draftVersion).toBe(before + 2);
  });

  it('marks the draft failed instead of ready when the agent produced no items', async () => {
    mockDraftCache.getById.mockResolvedValue({
      status: 'generating',
      items: [],
    });

    await expect(runQuickBookDraft(INPUT)).rejects.toThrow(
      '未能从截图生成草稿',
    );

    expect(mockDraftCache.markReady).not.toHaveBeenCalled();
    expect(mockDraftCache.markFailed).toHaveBeenCalledWith(
      INPUT.draftId,
      '未能从截图生成草稿',
    );
  });

  it('publishes reasoning, text and tool events while the agent streams', async () => {
    (createAgent as jest.Mock).mockImplementation(() => ({
      stream: jest.fn(async () => ({
        fullStream: streamOf([
          { type: 'reasoning-start', id: 'r1' },
          { type: 'reasoning-delta', id: 'r1', text: '先看金额' },
          { type: 'reasoning-end', id: 'r1' },
          { type: 'text-start', id: 't1' },
          { type: 'text-delta', id: 't1', text: '识别到两笔' },
          { type: 'text-end', id: 't1' },
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'saveRecordDrafts',
          },
          { type: 'tool-result', toolCallId: 'call-1' },
        ]),
      })),
    }));
    const snapshots: QuickBookDraftProgress[] = [];
    const unsubscribe = useQuickBookDraftProgressStore.subscribe(state => {
      const progress = state.progressById[INPUT.draftId];
      if (progress !== undefined) {
        snapshots.push(progress);
      }
    });

    await runQuickBookDraft(INPUT);
    unsubscribe();

    expect(snapshots[snapshots.length - 1]?.parts).toEqual([
      { type: 'reasoning', id: 'r1', text: '先看金额', isDone: true },
      { type: 'text', id: 't1', text: '识别到两笔', isDone: true },
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        status: 'done',
      },
    ]);
    expect(
      useQuickBookDraftProgressStore.getState().progressById[INPUT.draftId],
    ).toBeUndefined();
  });

  it('publishes partial saveRecordDrafts input before the tool finishes', async () => {
    (createAgent as jest.Mock).mockImplementation(() => ({
      stream: jest.fn(async () => ({
        fullStream: streamOf([
          {
            type: 'tool-input-start',
            id: 'call-1',
            toolName: 'saveRecordDrafts',
          },
          {
            type: 'tool-input-delta',
            id: 'call-1',
            delta:
              '{"summary":"午餐两笔","items":[{"amount":36.5},{"amount":12}]}',
          },
          {
            type: 'tool-call',
            toolCallId: 'call-1',
            toolName: 'saveRecordDrafts',
            input: {
              summary: '午餐两笔',
              items: [{ amount: 36.5 }, { amount: 12 }],
            },
          },
          { type: 'tool-result', toolCallId: 'call-1' },
        ]),
      })),
    }));
    const snapshots: QuickBookDraftProgress[] = [];
    const unsubscribe = useQuickBookDraftProgressStore.subscribe(state => {
      const progress = state.progressById[INPUT.draftId];
      if (progress !== undefined) {
        snapshots.push(progress);
      }
    });

    await runQuickBookDraft(INPUT);
    unsubscribe();

    expect(
      snapshots.some(progress =>
        progress.parts.some(
          part =>
            part.type === 'tool' &&
            part.status === 'preparing' &&
            part.summary === '午餐两笔' &&
            part.itemCount === 2,
        ),
      ),
    ).toBe(true);
    expect(snapshots[snapshots.length - 1]?.parts).toEqual([
      {
        type: 'tool',
        toolCallId: 'call-1',
        toolName: 'saveRecordDrafts',
        status: 'done',
        summary: '午餐两笔',
        itemCount: 2,
      },
    ]);
  });

  it('fails the draft when the stream reports an error', async () => {
    (createAgent as jest.Mock).mockImplementation(() => ({
      stream: jest.fn(async () => ({
        fullStream: streamOf([
          { type: 'error', error: new Error('模型服务不可用') },
        ]),
      })),
    }));

    await expect(runQuickBookDraft(INPUT)).rejects.toThrow('模型服务不可用');

    expect(mockDraftCache.markFailed).toHaveBeenCalledWith(
      INPUT.draftId,
      '模型服务不可用',
    );
    expect(
      useQuickBookDraftProgressStore.getState().progressById[INPUT.draftId],
    ).toBeUndefined();
  });

  it('fails the draft when the whole run exceeds the deadline', async () => {
    jest.useFakeTimers();
    try {
      (resolveBookApi as jest.Mock).mockReturnValue(
        new Promise(() => undefined),
      );

      const run = runQuickBookDraft(INPUT).catch(error => error);
      await jest.advanceTimersByTimeAsync(QUICK_BOOK_DRAFT_RUN_TIMEOUT_MS);
      const error = await run;

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('生成超时，请重试');
      expect(mockDraftCache.markFailed).toHaveBeenCalledWith(
        INPUT.draftId,
        '生成超时，请重试',
      );
      expect(
        useQuickBookDraftProgressStore.getState().progressById[INPUT.draftId],
      ).toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });

  it('acks the native job journal after the placeholder is stored', async () => {
    await runQuickBookDraft({ ...INPUT, reportOutcome: true });

    expect(mockedAckQuickBookDraftJob).toHaveBeenCalledWith(INPUT.draftId);
  });
});
