import { QUICK_BOOK_DRAFT_STATUS, type DraftItem } from '@pennyspring/api';

import {
  createQuickBookDraftCache,
  type DraftCacheStorage,
} from '../../src/features/quickBookDraft/draftCache';
import type { DraftBookTarget } from '../../src/features/quickBookDraft/draftBook';

class MemoryDraftStorage implements DraftCacheStorage {
  readonly values = new Map<string, string>();

  async getItem(key: string): Promise<string | undefined> {
    return this.values.get(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }

  async getAllKeys(): Promise<readonly string[]> {
    return Array.from(this.values.keys());
  }
}

const NOW = new Date(2026, 10, 8, 12, 0).getTime();

const LOCAL_TARGET: DraftBookTarget = {
  kind: 'local',
  serverUrl: '',
  booksId: 3,
  bookName: '本地账本',
};

const REMOTE_TARGET: DraftBookTarget = {
  kind: 'remote',
  serverUrl: 'https://example.com',
  booksId: 3,
  bookName: '网络账本',
};

function createDraftItem(remark: string): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: 10,
    typeName: '支出',
    amountCents: 1200,
    recordTime: NOW,
    remark,
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

function createFixture() {
  const storage = new MemoryDraftStorage();
  let now = NOW;
  const cache = createQuickBookDraftCache(storage, () => now);
  return {
    storage,
    cache,
    setNow: (value: number) => {
      now = value;
    },
  };
}

describe('quick book draft cache', () => {
  it('persists a placeholder with its target book and survives cache recreation', async () => {
    const { cache, storage } = createFixture();

    const created = await cache.createPlaceholder({
      id: 'draft-1',
      target: REMOTE_TARGET,
      imagePath: '/tmp/a.jpg',
    });

    expect(created.status).toBe(QUICK_BOOK_DRAFT_STATUS.generating);
    expect(created.target).toEqual(REMOTE_TARGET);
    expect(created.booksId).toBe(3);

    const reopened = createQuickBookDraftCache(storage, () => NOW);
    await expect(reopened.getById('draft-1')).resolves.toMatchObject({
      id: 'draft-1',
      target: REMOTE_TARGET,
    });
  });

  it('isolates drafts whose local and remote books share the same numeric id', async () => {
    const { cache } = createFixture();
    await cache.createPlaceholder({
      id: 'local-draft',
      target: LOCAL_TARGET,
      imagePath: '/tmp/local.jpg',
    });
    await cache.createPlaceholder({
      id: 'remote-draft',
      target: REMOTE_TARGET,
      imagePath: '/tmp/remote.jpg',
    });

    const local = await cache.list({ target: LOCAL_TARGET });
    const remote = await cache.list({ target: REMOTE_TARGET });

    expect(local.map(draft => draft.id)).toEqual(['local-draft']);
    expect(remote.map(draft => draft.id)).toEqual(['remote-draft']);
    await expect(cache.countOpen({ target: LOCAL_TARGET })).resolves.toBe(1);
    await expect(cache.countOpen({ target: REMOTE_TARGET })).resolves.toBe(1);
  });

  it('marks a draft ready and confirms items without losing the attempt id when duplicated', async () => {
    const { cache } = createFixture();
    await cache.createPlaceholder({
      id: 'draft-1',
      target: LOCAL_TARGET,
      imagePath: '/tmp/a.jpg',
    });
    await cache.updateItems(
      'draft-1',
      [createDraftItem('午餐'), createDraftItem('晚餐')],
      { assetId: 0, typeId: 10 },
    );
    await cache.markReady('draft-1');
    await cache.setConfirmAttempt('draft-1', 0, 'attempt-1');

    const confirmed = await cache.markItemConfirmed('draft-1', 0, 88);

    expect(confirmed.status).toBe(QUICK_BOOK_DRAFT_STATUS.pending);
    expect(confirmed.confirmedCount).toBe(1);
    expect(confirmed.items[0]?.recordId).toBe(88);
    expect(confirmed.items[0]?.confirmAttemptId).toBeUndefined();

    const allConfirmed = await cache.markItemConfirmed('draft-1', 1, 89);
    expect(allConfirmed.status).toBe(QUICK_BOOK_DRAFT_STATUS.confirmed);
    expect(allConfirmed.recordIds).toEqual([88, 89]);
  });

  it('rejects editing an item while its confirmation attempt is unresolved', async () => {
    const { cache } = createFixture();
    await cache.createPlaceholder({
      id: 'draft-1',
      target: LOCAL_TARGET,
      imagePath: '/tmp/a.jpg',
    });
    await cache.updateItems('draft-1', [createDraftItem('午餐')], {
      assetId: 0,
      typeId: 10,
    });
    await cache.markReady('draft-1');
    await cache.setConfirmAttempt('draft-1', 0, 'attempt-1');

    await expect(
      cache.updateItem('draft-1', 0, { remark: '改备注' }),
    ).rejects.toThrow('该笔正在确认中，请先重试或等待结果');
  });

  it('discards a draft and removes expired discarded drafts with their image paths', async () => {
    const { cache, setNow } = createFixture();
    await cache.createPlaceholder({
      id: 'draft-1',
      target: LOCAL_TARGET,
      imagePath: '/tmp/a.jpg',
    });

    await expect(cache.discard('draft-1')).resolves.toEqual(['/tmp/a.jpg']);

    setNow(NOW + 8 * 24 * 60 * 60 * 1000);
    await expect(cache.cleanup()).resolves.toEqual(['/tmp/a.jpg']);
    await expect(cache.getById('draft-1')).rejects.toThrow('草稿不存在');
  });

  it('marks timed-out generating drafts failed during cleanup', async () => {
    const { cache, setNow } = createFixture();
    await cache.createPlaceholder({
      id: 'draft-1',
      target: LOCAL_TARGET,
      imagePath: '/tmp/a.jpg',
    });

    setNow(NOW + 6 * 60 * 1000);
    await cache.cleanup();

    await expect(cache.getById('draft-1')).resolves.toMatchObject({
      status: QUICK_BOOK_DRAFT_STATUS.failed,
      errorText: '生成超时，请重试',
    });
  });

  it('only checks local books when deciding whether a book still exists', async () => {
    const { cache } = createFixture();
    await cache.createPlaceholder({
      id: 'local-draft',
      target: LOCAL_TARGET,
      imagePath: '/tmp/local.jpg',
    });
    await cache.createPlaceholder({
      id: 'remote-draft',
      target: REMOTE_TARGET,
      imagePath: '/tmp/remote.jpg',
    });

    await cache.cleanup({
      isLocalBookExisting: async booksId => booksId !== LOCAL_TARGET.booksId,
    });

    await expect(cache.getById('local-draft')).resolves.toMatchObject({
      status: QUICK_BOOK_DRAFT_STATUS.failed,
      errorText: '目标账本已不存在',
    });
    await expect(cache.getById('remote-draft')).resolves.toMatchObject({
      status: QUICK_BOOK_DRAFT_STATUS.generating,
    });
  });
});
