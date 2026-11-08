jest.mock('../../src/features/quickBookDraft/native', () => ({
  getQuickBookActiveDraftIds: jest.fn(),
  getQuickBookPendingDraftJobs: jest.fn(),
  ackQuickBookDraftJob: jest.fn(),
}));

jest.mock('../../src/features/quickBookDraft/draftCacheStorage', () => ({
  quickBookDraftCache: {
    list: jest.fn(),
    markFailed: jest.fn(),
    getById: jest.fn(),
    createPlaceholder: jest.fn(),
  },
}));

import { QUICK_BOOK_DRAFT_STATUS } from '@pennyspring/api';

import { quickBookDraftCache } from '../../src/features/quickBookDraft/draftCacheStorage';
import {
  beginQuickBookDraftProgress,
  useQuickBookDraftProgressStore,
} from '../../src/features/quickBookDraft/draftProgress';
import {
  getQuickBookActiveDraftIds,
  getQuickBookPendingDraftJobs,
} from '../../src/features/quickBookDraft/native';
import {
  INTERRUPTED_DRAFT_ERROR,
  reconcileInterruptedQuickBookDrafts,
} from '../../src/features/quickBookDraft/reconcileInterruptedDrafts';
import { useDraftVersionStore } from '../../src/stores/draftVersionStore';

const mockedGetActiveDraftIds = getQuickBookActiveDraftIds as jest.Mock;
const mockedGetPendingJobs = getQuickBookPendingDraftJobs as jest.Mock;
const mockedList = quickBookDraftCache.list as unknown as jest.Mock;
const mockedMarkFailed = quickBookDraftCache.markFailed as unknown as jest.Mock;
const mockedGetById = quickBookDraftCache.getById as unknown as jest.Mock;
const mockedCreatePlaceholder =
  quickBookDraftCache.createPlaceholder as unknown as jest.Mock;

function draftRecord(id: string) {
  return { id } as never;
}

beforeEach(() => {
  jest.clearAllMocks();
  useQuickBookDraftProgressStore.setState({ progressById: {} });
  mockedGetPendingJobs.mockResolvedValue([]);
  mockedList.mockResolvedValue([]);
  mockedMarkFailed.mockResolvedValue(undefined);
  mockedGetById.mockRejectedValue(new Error('草稿不存在'));
  mockedCreatePlaceholder.mockResolvedValue({ status: 'generating' });
});

describe('reconcileInterruptedQuickBookDrafts', () => {
  it('marks generating drafts without a live task as failed', async () => {
    mockedGetActiveDraftIds.mockResolvedValue([]);
    mockedList.mockResolvedValue([draftRecord('draft-1')]);
    const versionBefore = useDraftVersionStore.getState().draftVersion;

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(1);

    expect(mockedList).toHaveBeenCalledWith({
      statuses: [QUICK_BOOK_DRAFT_STATUS.generating],
    });
    expect(mockedMarkFailed).toHaveBeenCalledWith(
      'draft-1',
      INTERRUPTED_DRAFT_ERROR,
    );
    expect(useDraftVersionStore.getState().draftVersion).toBe(
      versionBefore + 1,
    );
  });

  it('keeps drafts that the native task registry still reports active', async () => {
    mockedGetActiveDraftIds.mockResolvedValue(['draft-1']);
    mockedList.mockResolvedValue([draftRecord('draft-1')]);
    const versionBefore = useDraftVersionStore.getState().draftVersion;

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(0);

    expect(mockedMarkFailed).not.toHaveBeenCalled();
    expect(useDraftVersionStore.getState().draftVersion).toBe(versionBefore);
  });

  it('keeps drafts with progress in the current JS session', async () => {
    mockedGetActiveDraftIds.mockResolvedValue([]);
    mockedList.mockResolvedValue([draftRecord('draft-1')]);
    beginQuickBookDraftProgress('draft-1');

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(0);

    expect(mockedMarkFailed).not.toHaveBeenCalled();
  });

  it('falls back to session progress when the native task query fails', async () => {
    mockedGetActiveDraftIds.mockRejectedValue(new Error('native unavailable'));
    mockedList.mockResolvedValue([
      draftRecord('draft-1'),
      draftRecord('draft-2'),
    ]);
    beginQuickBookDraftProgress('draft-1');

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(1);

    expect(mockedMarkFailed).toHaveBeenCalledWith(
      'draft-2',
      INTERRUPTED_DRAFT_ERROR,
    );
  });

  it('dedupes concurrent reconciliation runs', async () => {
    mockedGetActiveDraftIds.mockResolvedValue([]);
    let resolveList: (value: unknown) => void = () => undefined;
    mockedList.mockReturnValue(
      new Promise(resolve => {
        resolveList = resolve;
      }),
    );

    const first = reconcileInterruptedQuickBookDrafts();
    const second = reconcileInterruptedQuickBookDrafts();
    resolveList([]);

    await expect(Promise.all([first, second])).resolves.toEqual([0, 0]);
    expect(mockedList).toHaveBeenCalledTimes(1);
  });

  it('materializes a failed draft for a job that never wrote its placeholder', async () => {
    mockedGetActiveDraftIds.mockResolvedValue([]);
    mockedGetPendingJobs.mockResolvedValue([
      {
        draftId: 'draft-9',
        imagePath: '/tmp/share.jpg',
        bookRef: JSON.stringify({
          kind: 'local',
          serverUrl: '',
          booksId: 3,
          bookName: '草稿账本',
        }),
        booksId: 3,
        assetId: 0,
        typeId: 0,
        source: 'share',
      },
    ]);

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(1);

    expect(mockedCreatePlaceholder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'draft-9',
        imagePath: '/tmp/share.jpg',
      }),
    );
    expect(mockedMarkFailed).toHaveBeenCalledWith(
      'draft-9',
      INTERRUPTED_DRAFT_ERROR,
    );
  });

  it('does not materialize jobs while native status is unavailable', async () => {
    mockedGetActiveDraftIds.mockRejectedValue(new Error('native unavailable'));
    mockedGetPendingJobs.mockResolvedValue([
      {
        draftId: 'draft-9',
        imagePath: '/tmp/share.jpg',
        bookRef: JSON.stringify({
          kind: 'local',
          serverUrl: '',
          booksId: 3,
          bookName: '草稿账本',
        }),
        booksId: 3,
        source: 'share',
      },
    ]);

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(0);

    expect(mockedCreatePlaceholder).not.toHaveBeenCalled();
  });

  it('continues with other drafts when one was advanced concurrently', async () => {
    mockedGetActiveDraftIds.mockResolvedValue([]);
    mockedList.mockResolvedValue([
      draftRecord('draft-1'),
      draftRecord('draft-2'),
    ]);
    mockedMarkFailed
      .mockRejectedValueOnce(new Error('草稿状态不允许标记失败: pending'))
      .mockResolvedValueOnce(undefined);

    await expect(reconcileInterruptedQuickBookDrafts()).resolves.toBe(1);

    expect(mockedMarkFailed).toHaveBeenCalledTimes(2);
  });
});
