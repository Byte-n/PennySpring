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

jest.mock('@pennyspring/api', () => {
  const actual = jest.requireActual('@pennyspring/api');
  return {
    ...actual,
    localApi: {
      book: { getById: jest.fn() },
      provider: { getAll: jest.fn() },
      quickBook: { getSelection: jest.fn() },
      credential: { getKey: jest.fn() },
      quickBookDraft: {
        createPlaceholder: jest.fn(),
        setAgent: jest.fn(),
        getById: jest.fn(),
        markReady: jest.fn(),
        markFailed: jest.fn(),
      },
    },
  };
});

import type { AgentProviderModel, AgentSelection } from '@pennyspring/api';
import { localApi } from '@pennyspring/api';

import { createAgent } from '../../src/agent/core/createAgent';
import { runQuickBookDraft } from '../../src/agent/headless/runQuickBookDraft';
import { resolveQuickBookModel } from '../../src/features/quickBook/validation';
import { useDraftVersionStore } from '../../src/stores/draftVersionStore';

const INPUT = {
  draftId: 'draft-1',
  imagePath: '/tmp/share.jpg',
  booksId: 3,
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

const draftApi = localApi.quickBookDraft as unknown as {
  createPlaceholder: jest.Mock;
  setAgent: jest.Mock;
  getById: jest.Mock;
  markReady: jest.Mock;
  markFailed: jest.Mock;
};

const bookApi = localApi.book as unknown as { getById: jest.Mock };
const providerApi = localApi.provider as unknown as { getAll: jest.Mock };
const quickBookApi = localApi.quickBook as unknown as {
  getSelection: jest.Mock;
};
const credentialApi = localApi.credential as unknown as { getKey: jest.Mock };

let order: string[];

beforeEach(() => {
  order = [];
  jest.clearAllMocks();
  draftApi.createPlaceholder.mockImplementation(async () => {
    order.push('placeholder');
    return { status: 'generating', items: [] };
  });
  draftApi.setAgent.mockResolvedValue({ status: 'generating' });
  draftApi.getById.mockResolvedValue({
    status: 'generating',
    items: [{ status: 'pending' }],
  });
  draftApi.markReady.mockImplementation(async () => {
    order.push('ready');
    return { status: 'pending' };
  });
  draftApi.markFailed.mockResolvedValue(undefined);
  bookApi.getById.mockResolvedValue({ id: 3, name: '草稿账本' });
  providerApi.getAll.mockResolvedValue([PROVIDER]);
  quickBookApi.getSelection.mockImplementation(async () => {
    order.push('resolve');
    return SELECTION;
  });
  credentialApi.getKey.mockResolvedValue('api-key');
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
    expect(draftApi.markReady).toHaveBeenCalledWith(INPUT.draftId);
  });

  it('records the provider and model as soon as model resolution succeeds', async () => {
    await runQuickBookDraft(INPUT);

    expect(draftApi.setAgent).toHaveBeenCalledWith(INPUT.draftId, {
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
    expect(draftApi.markFailed).toHaveBeenCalledWith(
      INPUT.draftId,
      '请先在 AI 记账设置中选择 AI 提供商。',
    );
    expect(useDraftVersionStore.getState().draftVersion).toBe(before + 2);
  });

  it('marks the draft failed instead of ready when the agent produced no items', async () => {
    draftApi.getById.mockResolvedValue({ status: 'generating', items: [] });

    await expect(runQuickBookDraft(INPUT)).rejects.toThrow(
      '未能从截图生成草稿',
    );

    expect(draftApi.markReady).not.toHaveBeenCalled();
    expect(draftApi.markFailed).toHaveBeenCalledWith(
      INPUT.draftId,
      '未能从截图生成草稿',
    );
  });
});
