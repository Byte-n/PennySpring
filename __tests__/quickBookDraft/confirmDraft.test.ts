jest.mock('../../src/features/quickBookDraft/draftCacheStorage', () => {
  const { createQuickBookDraftCache } = jest.requireActual(
    '../../src/features/quickBookDraft/draftCache',
  ) as typeof import('../../src/features/quickBookDraft/draftCache');
  const values = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => values.get(key),
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: async (key: string) => {
      values.delete(key);
    },
    getAllKeys: async () => Array.from(values.keys()),
  };
  return { quickBookDraftCache: createQuickBookDraftCache(storage) };
});

import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  type Api,
  type DraftItem,
  type TypeRow,
} from '@pennyspring/api';

import { confirmQuickBookDraftItem } from '../../src/features/quickBookDraft/confirmDraft';
import {
  type DraftBookTarget,
  getDraftBookKey,
} from '../../src/features/quickBookDraft/draftBook';
import { quickBookDraftCache } from '../../src/features/quickBookDraft/draftCacheStorage';
import type { MediaStore } from '../../src/media';

const NOW = new Date(2026, 10, 8, 12, 0).getTime();

const LOCAL_TARGET: DraftBookTarget = {
  kind: 'local',
  serverUrl: '',
  booksId: 1,
  bookName: '本地账本',
};

const REMOTE_TARGET: DraftBookTarget = {
  kind: 'remote',
  serverUrl: 'https://example.com',
  booksId: 1,
  bookName: '网络账本',
};

const TYPE_ROW: TypeRow = {
  id: 10,
  booksId: 1,
  parentId: 0,
  name: '餐饮',
  icon: '',
  typeCategory: RECORD_TYPE_CATEGORY.expense,
  isSystem: SYSTEM_STATUS.system,
  specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
  sort: 0,
  createdTime: NOW,
  updatedTime: NOW,
};

function createDraftItem(): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: TYPE_ROW.id,
    typeName: TYPE_ROW.name,
    amountCents: 1200,
    recordTime: NOW,
    remark: '午餐',
    assetId: 0,
    assetName: '',
    intoAssetId: 0,
    intoAssetName: '',
    chargeCents: 0,
    tagIds: [],
    reimbursable: false,
    warnings: [],
  };
}

function createBookApi(create: jest.Mock): Api {
  return {
    type: { getAll: jest.fn(async () => [TYPE_ROW]) },
    asset: { getByBook: jest.fn(async () => []) },
    record: { create },
  } as unknown as Api;
}

async function seedDraft(
  id: string,
  target: DraftBookTarget,
  attachImage = false,
) {
  await quickBookDraftCache.createPlaceholder({
    id,
    target,
    imagePath: '/tmp/a.jpg',
  });
  await quickBookDraftCache.updateItems(id, [createDraftItem()], {
    assetId: 0,
    typeId: TYPE_ROW.id,
  });
  await quickBookDraftCache.markReady(id);
  if (attachImage) {
    await quickBookDraftCache.setAttachImage(id, true);
  }
}

describe('confirmQuickBookDraftItem', () => {
  it('creates the record through the target book with a stable mutation id', async () => {
    await seedDraft('draft-1', LOCAL_TARGET);
    const create = jest.fn(async () => ({ id: 88 }));
    const bookApi = createBookApi(create);

    const result = await confirmQuickBookDraftItem({
      draftId: 'draft-1',
      itemIndex: 0,
      target: LOCAL_TARGET,
      bookApi,
      media: null,
    });

    expect(result.recordId).toBe(88);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        booksId: 1,
        amount: 1200,
        typeId: TYPE_ROW.id,
        clientMutationId: expect.stringContaining('draft-1:0'),
      }),
    );
    await expect(quickBookDraftCache.getById('draft-1')).resolves.toMatchObject(
      {
        status: 'confirmed',
        confirmedCount: 1,
      },
    );
  });

  it('reuses the same mutation id when a failed remote confirmation is retried', async () => {
    await seedDraft('draft-2', REMOTE_TARGET);
    const create = jest
      .fn()
      .mockRejectedValueOnce(new Error('网络超时'))
      .mockResolvedValueOnce({ id: 89 });
    const bookApi = createBookApi(create);

    await expect(
      confirmQuickBookDraftItem({
        draftId: 'draft-2',
        itemIndex: 0,
        target: REMOTE_TARGET,
        bookApi,
        media: null,
      }),
    ).rejects.toThrow('网络超时');

    const pending = await quickBookDraftCache.getById('draft-2');
    const attemptId = pending.items[0]?.confirmAttemptId;
    expect(attemptId).toBeDefined();

    const result = await confirmQuickBookDraftItem({
      draftId: 'draft-2',
      itemIndex: 0,
      target: REMOTE_TARGET,
      bookApi,
      media: null,
    });

    expect(result.recordId).toBe(89);
    expect(create.mock.calls[0]?.[0].clientMutationId).toBe(attemptId);
    expect(create.mock.calls[1]?.[0].clientMutationId).toBe(attemptId);
  });

  it('uploads the draft screenshot through the target media store before confirming', async () => {
    await seedDraft('draft-3', REMOTE_TARGET, true);
    const create = jest.fn(async () => ({ id: 90 }));
    const bookApi = createBookApi(create);
    const media = {
      save: jest.fn(async () => 'media:remote.jpg'),
    } as unknown as MediaStore;

    await confirmQuickBookDraftItem({
      draftId: 'draft-3',
      itemIndex: 0,
      target: REMOTE_TARGET,
      bookApi,
      media,
    });

    expect(media.save).toHaveBeenCalledWith(
      expect.objectContaining({ uri: '/tmp/a.jpg' }),
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ imagePaths: ['media:remote.jpg'] }),
    );
    expect(getDraftBookKey(REMOTE_TARGET)).toBe('remote:https://example.com:1');
  });
});
