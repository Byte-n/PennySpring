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
  reportQuickBookDraftOutcome: jest.fn(async () => undefined),
}));

import type { AgentProviderModel, AgentSelection } from '@pennyspring/api';

import { createAgent } from '../../src/agent/core/createAgent';
import { runQuickBookDraft } from '../../src/agent/headless/runQuickBookDraft';
import { resolveQuickBookModel } from '../../src/features/quickBook/validation';
import { resolveBookApi } from '../../src/features/quickBookDraft/bookApi';
import type { DraftBookTarget } from '../../src/features/quickBookDraft/draftBook';
import { quickBookDraftCache } from '../../src/features/quickBookDraft/draftCacheStorage';
import { useDraftVersionStore } from '../../src/stores/draftVersionStore';

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

beforeEach(() => {
  order = [];
  jest.clearAllMocks();
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
    generate: jest.fn(async () => {
      order.push('generate');
    }),
  }));
});

describe('runQuickBookDraft lifecycle', () => {
  it('creates the placeholder before model resolution and marks ready after generation', async () => {
    await runQuickBookDraft(INPUT);

    expect(order).toEqual(['placeholder', 'resolve', 'generate', 'ready']);
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
});
