import {
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  type DraftItem,
  type QuickBookDraftAgentInfo,
  type QuickBookDraftItemPatch,
  type QuickBookDraftPreset,
  type QuickBookDraftRow,
  type QuickBookDraftSourceValue,
  type QuickBookDraftStatusValue,
  type QuickBookDraftUpdateMeta,
} from '@pennyspring/api';

import {
  type DraftBookTarget,
  createDraftBookTarget,
  isSameDraftBook,
  normalizeDraftBookName,
} from './draftBook';
import {
  type CachedQuickBookDraft,
  assertDraftSource,
  getDraftItemAtIndex,
  normalizeAgentInfo,
  normalizeDraftItem,
  normalizeDraftItems,
  normalizePreset,
  normalizeUpdateMeta,
  parseCachedDraft,
} from './draftCacheNormalize';

export const DRAFT_CACHE_KEY_PREFIX = 'pennyspring-quick-book-draft:v1:';

const GENERATING_TIMEOUT_MS = 5 * 60 * 1000;
const DISCARDED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const CONFIRMED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const GENERATING_TIMEOUT_ERROR = '生成超时，请重试';

const OPEN_STATUSES: QuickBookDraftStatusValue[] = [
  QUICK_BOOK_DRAFT_STATUS.generating,
  QUICK_BOOK_DRAFT_STATUS.pending,
  QUICK_BOOK_DRAFT_STATUS.failed,
];

export interface QuickBookDraftRecord extends QuickBookDraftRow {
  target: DraftBookTarget;
  attachmentRef: string;
}

export interface DraftCacheStorage {
  getItem(key: string): Promise<string | undefined>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
}

export interface CreateQuickBookDraftCacheInput {
  id: string;
  target: DraftBookTarget;
  imagePath: string;
  source?: QuickBookDraftSourceValue;
  preset?: Partial<QuickBookDraftPreset>;
  agentProviderId?: number;
  agentModelId?: string;
}

export interface QuickBookDraftListFilter {
  target?: DraftBookTarget;
  statuses?: QuickBookDraftStatusValue[];
}

export interface QuickBookDraftCleanupOptions {
  now?: number;
  isLocalBookExisting?: (booksId: number) => Promise<boolean>;
}

export interface QuickBookDraftCache {
  createPlaceholder(
    input: CreateQuickBookDraftCacheInput,
  ): Promise<QuickBookDraftRecord>;
  getById(id: string): Promise<QuickBookDraftRecord>;
  list(filter?: QuickBookDraftListFilter): Promise<QuickBookDraftRecord[]>;
  countOpen(filter?: QuickBookDraftListFilter): Promise<number>;
  updateItems(
    id: string,
    items: readonly DraftItem[],
    preset: QuickBookDraftPreset,
    meta?: QuickBookDraftUpdateMeta,
  ): Promise<QuickBookDraftRecord>;
  setAgent(
    id: string,
    info: QuickBookDraftAgentInfo,
  ): Promise<QuickBookDraftRecord>;
  markReady(id: string): Promise<QuickBookDraftRecord>;
  markFailed(id: string, errorText: string): Promise<void>;
  getItem(id: string, itemIndex: number): Promise<DraftItem>;
  updateItem(
    id: string,
    itemIndex: number,
    patch: QuickBookDraftItemPatch,
  ): Promise<DraftItem>;
  setAttachImage(
    id: string,
    attachImage: boolean,
  ): Promise<QuickBookDraftRecord>;
  setConfirmAttempt(
    id: string,
    itemIndex: number,
    attemptId: string,
  ): Promise<DraftItem>;
  clearConfirmAttempt(id: string, itemIndex: number): Promise<DraftItem>;
  setAttachmentRef(
    id: string,
    attachmentRef: string,
  ): Promise<QuickBookDraftRecord>;
  markItemConfirmed(
    id: string,
    itemIndex: number,
    recordId: number,
  ): Promise<QuickBookDraftRecord>;
  discard(id: string): Promise<string[]>;
  cleanup(options?: QuickBookDraftCleanupOptions): Promise<string[]>;
}

function cacheKey(id: string): string {
  return `${DRAFT_CACHE_KEY_PREFIX}${id}`;
}

function normalizeDraftId(value: string): string {
  const id = typeof value === 'string' ? value.trim() : '';
  if (id === '') {
    throw new Error('草稿 id 不能为空');
  }
  return id;
}

function toRecord(draft: CachedQuickBookDraft): QuickBookDraftRecord {
  const confirmed = draft.items.filter(item => item.status === 'confirmed');
  return {
    ...draft,
    booksId: draft.target.booksId,
    confirmedCount: confirmed.length,
    recordIds: confirmed.map(item => item.recordId).filter(id => id > 0),
  };
}

function sortDrafts(
  left: CachedQuickBookDraft,
  right: CachedQuickBookDraft,
): number {
  if (left.updatedTime !== right.updatedTime) {
    return right.updatedTime - left.updatedTime;
  }
  if (left.createdTime !== right.createdTime) {
    return right.createdTime - left.createdTime;
  }
  return right.id.localeCompare(left.id);
}

function matchesFilter(
  draft: CachedQuickBookDraft,
  filter: QuickBookDraftListFilter | undefined,
): boolean {
  if (filter?.target && !isSameDraftBook(draft.target, filter.target)) {
    return false;
  }
  const statuses = filter?.statuses ?? OPEN_STATUSES;
  return statuses.includes(draft.status);
}

export function createQuickBookDraftCache(
  storage: DraftCacheStorage,
  now: () => number = Date.now,
): QuickBookDraftCache {
  let queue: Promise<unknown> = Promise.resolve();

  function runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const result = queue.then(task, task);
    queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async function readDraft(id: string): Promise<CachedQuickBookDraft> {
    const raw = await storage.getItem(cacheKey(id));
    if (raw === undefined) {
      throw new Error(`草稿不存在: ${id}`);
    }
    return parseCachedDraft(id, raw);
  }

  async function writeDraft(draft: CachedQuickBookDraft): Promise<void> {
    await storage.setItem(cacheKey(draft.id), JSON.stringify(draft));
  }

  async function listRaw(): Promise<CachedQuickBookDraft[]> {
    const keys = await storage.getAllKeys();
    const drafts: CachedQuickBookDraft[] = [];
    for (const key of keys) {
      if (!key.startsWith(DRAFT_CACHE_KEY_PREFIX)) {
        continue;
      }
      const id = key.slice(DRAFT_CACHE_KEY_PREFIX.length);
      const raw = await storage.getItem(key);
      if (raw === undefined) {
        continue;
      }
      try {
        drafts.push(parseCachedDraft(id, raw));
      } catch {
        await storage.removeItem(key);
      }
    }
    return drafts;
  }

  async function mutateDraft(
    id: string,
    mutate: (draft: CachedQuickBookDraft) => CachedQuickBookDraft,
  ): Promise<QuickBookDraftRecord> {
    return runExclusive(async () => {
      const next = mutate(await readDraft(id));
      await writeDraft(next);
      return toRecord(next);
    });
  }

  async function listRecords(
    filter?: QuickBookDraftListFilter,
  ): Promise<QuickBookDraftRecord[]> {
    const drafts = (await listRaw()).filter(draft =>
      matchesFilter(draft, filter),
    );
    drafts.sort(sortDrafts);
    return drafts.map(toRecord);
  }

  return {
    createPlaceholder(input) {
      const id = normalizeDraftId(input.id);
      if (input.target.booksId <= 0) {
        throw new Error(`账本 id 不合法: ${input.target.booksId}`);
      }
      if (
        typeof input.imagePath !== 'string' ||
        input.imagePath.trim() === ''
      ) {
        throw new Error('草稿图片路径不能为空');
      }
      const source = input.source ?? QUICK_BOOK_DRAFT_SOURCE.floatingCapture;
      assertDraftSource(source);
      const preset = normalizePreset(input.preset);
      const agentProviderId =
        typeof input.agentProviderId === 'number' ? input.agentProviderId : 0;
      const agentModelId =
        typeof input.agentModelId === 'string' ? input.agentModelId : '';

      const target = createDraftBookTarget(input.target);
      return runExclusive(async () => {
        const timestamp = now();
        let createdTime = timestamp;
        let existing: CachedQuickBookDraft | null = null;
        const raw = await storage.getItem(cacheKey(id));
        if (raw !== undefined) {
          existing = parseCachedDraft(id, raw);
          if (existing.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
            throw new Error('草稿已完成确认，无法重新生成');
          }
          createdTime = existing.createdTime;
        }
        const next: CachedQuickBookDraft = {
          id,
          target: {
            ...target,
            bookName: normalizeDraftBookName(target.bookName),
          },
          status: QUICK_BOOK_DRAFT_STATUS.generating,
          source,
          imagePath: input.imagePath,
          attachImage: existing?.attachImage ?? false,
          items: [],
          preset,
          agentProviderId,
          agentModelId,
          agentSummary: '',
          errorText: '',
          attachmentRef: '',
          createdTime,
          updatedTime: timestamp,
          confirmedAt: 0,
        };
        await writeDraft(next);
        return toRecord(next);
      });
    },

    async getById(id) {
      return toRecord(await readDraft(normalizeDraftId(id)));
    },

    list: listRecords,

    async countOpen(filter) {
      return (await listRecords(filter)).length;
    },

    updateItems(id, items, preset, meta) {
      const draftId = normalizeDraftId(id);
      return mutateDraft(draftId, draft => {
        if (
          draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed ||
          draft.status === QUICK_BOOK_DRAFT_STATUS.discarded
        ) {
          throw new Error(`草稿状态不允许写入: ${draft.status}`);
        }
        if (draft.items.some(item => item.status === 'confirmed')) {
          throw new Error('草稿已有确认的记录，无法覆盖');
        }
        const timestamp = now();
        const nextItems = normalizeDraftItems(items, 'input', timestamp).map(
          item => ({ ...item, attachImage: draft.attachImage }),
        );
        return {
          ...draft,
          items: nextItems,
          preset: normalizePreset(preset),
          ...normalizeUpdateMeta(meta),
          errorText: '',
          confirmedAt: 0,
          updatedTime: timestamp,
        };
      });
    },

    setAgent(id, info) {
      const draftId = normalizeDraftId(id);
      const agent = normalizeAgentInfo(info);
      return mutateDraft(draftId, draft => {
        if (draft.status !== QUICK_BOOK_DRAFT_STATUS.generating) {
          throw new Error(`草稿状态不允许更新生成信息: ${draft.status}`);
        }
        return {
          ...draft,
          agentProviderId: agent.agentProviderId,
          agentModelId: agent.agentModelId,
          updatedTime: now(),
        };
      });
    },

    markReady(id) {
      return mutateDraft(normalizeDraftId(id), draft => {
        if (draft.status !== QUICK_BOOK_DRAFT_STATUS.generating) {
          throw new Error(`草稿状态不允许完成生成: ${draft.status}`);
        }
        if (draft.items.length === 0) {
          throw new Error('草稿没有生成任何明细');
        }
        return {
          ...draft,
          status: QUICK_BOOK_DRAFT_STATUS.pending,
          errorText: '',
          updatedTime: now(),
        };
      });
    },

    markFailed(id, errorText) {
      const draftId = normalizeDraftId(id);
      return runExclusive(async () => {
        const draft = await readDraft(draftId);
        if (
          draft.status !== QUICK_BOOK_DRAFT_STATUS.generating &&
          draft.status !== QUICK_BOOK_DRAFT_STATUS.failed
        ) {
          throw new Error(`草稿状态不允许标记失败: ${draft.status}`);
        }
        await writeDraft({
          ...draft,
          status: QUICK_BOOK_DRAFT_STATUS.failed,
          errorText: typeof errorText === 'string' ? errorText : '',
          updatedTime: now(),
        });
      });
    },

    async getItem(id, itemIndex) {
      const draft = await readDraft(normalizeDraftId(id));
      return getDraftItemAtIndex(draft.items, itemIndex);
    },

    updateItem(id, itemIndex, patch) {
      const draftId = normalizeDraftId(id);
      return runExclusive(async () => {
        const draft = await readDraft(draftId);
        if (draft.status !== QUICK_BOOK_DRAFT_STATUS.pending) {
          throw new Error(`草稿状态不允许修改: ${draft.status}`);
        }
        const current = getDraftItemAtIndex(draft.items, itemIndex);
        if (current.status === 'confirmed') {
          throw new Error('已记账的草稿笔不能修改');
        }
        if (current.confirmAttemptId !== undefined) {
          throw new Error('该笔正在确认中，请先重试或等待结果');
        }
        const timestamp = now();
        const updated = normalizeDraftItem(
          {
            ...current,
            ...patch,
            status: current.status,
            recordId: current.recordId,
            warnings: [],
          },
          itemIndex,
          'stored',
          timestamp,
        );
        const items = draft.items.map((item, index) =>
          index === itemIndex ? updated : item,
        );
        await writeDraft({ ...draft, items, updatedTime: timestamp });
        return updated;
      });
    },

    setAttachImage(id, attachImage) {
      if (typeof attachImage !== 'boolean') {
        throw new Error('草稿带图设置不合法');
      }
      return mutateDraft(normalizeDraftId(id), draft => {
        if (draft.status !== QUICK_BOOK_DRAFT_STATUS.pending) {
          throw new Error(`草稿状态不允许修改: ${draft.status}`);
        }
        return {
          ...draft,
          attachImage,
          items: draft.items.map(item =>
            item.status === 'confirmed' ? item : { ...item, attachImage },
          ),
          updatedTime: now(),
        };
      });
    },

    setConfirmAttempt(id, itemIndex, attemptId) {
      const draftId = normalizeDraftId(id);
      const normalizedAttemptId =
        typeof attemptId === 'string' ? attemptId.trim() : '';
      if (normalizedAttemptId === '' || normalizedAttemptId.length > 128) {
        throw new Error('确认尝试 id 不合法');
      }
      return runExclusive(async () => {
        const draft = await readDraft(draftId);
        if (draft.status !== QUICK_BOOK_DRAFT_STATUS.pending) {
          throw new Error(`草稿状态不允许确认: ${draft.status}`);
        }
        const current = getDraftItemAtIndex(draft.items, itemIndex);
        if (current.status === 'confirmed') {
          throw new Error('已记账的草稿笔不能重复确认');
        }
        const updated: DraftItem = {
          ...current,
          confirmAttemptId: normalizedAttemptId,
        };
        const items = draft.items.map((item, index) =>
          index === itemIndex ? updated : item,
        );
        await writeDraft({ ...draft, items, updatedTime: now() });
        return updated;
      });
    },

    clearConfirmAttempt(id, itemIndex) {
      const draftId = normalizeDraftId(id);
      return runExclusive(async () => {
        const draft = await readDraft(draftId);
        const current = getDraftItemAtIndex(draft.items, itemIndex);
        if (current.status === 'confirmed') {
          return current;
        }
        const updated: DraftItem = {
          ...current,
          confirmAttemptId: undefined,
        };
        const items = draft.items.map((item, index) =>
          index === itemIndex ? updated : item,
        );
        await writeDraft({ ...draft, items, updatedTime: now() });
        return updated;
      });
    },

    setAttachmentRef(id, attachmentRef) {
      const draftId = normalizeDraftId(id);
      return mutateDraft(draftId, draft => {
        if (draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
          throw new Error('草稿已完成确认，无法修改附件');
        }
        return {
          ...draft,
          attachmentRef: typeof attachmentRef === 'string' ? attachmentRef : '',
          updatedTime: now(),
        };
      });
    },

    markItemConfirmed(id, itemIndex, recordId) {
      if (!Number.isInteger(recordId) || recordId <= 0) {
        throw new Error(`记录 id 不合法: ${recordId}`);
      }
      return mutateDraft(normalizeDraftId(id), draft => {
        if (draft.status === QUICK_BOOK_DRAFT_STATUS.discarded) {
          throw new Error('草稿已丢弃，无法确认');
        }
        const current = getDraftItemAtIndex(draft.items, itemIndex);
        if (current.status === 'confirmed') {
          if (current.recordId === recordId) {
            return draft;
          }
          throw new Error('已记账的草稿笔不能重复确认');
        }
        if (draft.status !== QUICK_BOOK_DRAFT_STATUS.pending) {
          throw new Error(`草稿状态不允许确认: ${draft.status}`);
        }
        const timestamp = now();
        const items = draft.items.map((item, index) =>
          index === itemIndex
            ? {
                ...item,
                status: 'confirmed' as const,
                recordId,
                confirmAttemptId: undefined,
              }
            : item,
        );
        const allConfirmed =
          items.length > 0 && items.every(item => item.status === 'confirmed');
        return {
          ...draft,
          items,
          status: allConfirmed
            ? QUICK_BOOK_DRAFT_STATUS.confirmed
            : QUICK_BOOK_DRAFT_STATUS.pending,
          errorText: '',
          confirmedAt: allConfirmed ? timestamp : 0,
          updatedTime: timestamp,
        };
      });
    },

    discard(id) {
      const draftId = normalizeDraftId(id);
      return runExclusive(async () => {
        const draft = await readDraft(draftId);
        if (draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
          throw new Error('草稿已完成确认，无法丢弃');
        }
        if (draft.status === QUICK_BOOK_DRAFT_STATUS.discarded) {
          return [];
        }
        await writeDraft({
          ...draft,
          status: QUICK_BOOK_DRAFT_STATUS.discarded,
          updatedTime: now(),
        });
        return draft.imagePath === '' ? [] : [draft.imagePath];
      });
    },

    cleanup(options) {
      const timestamp = options?.now ?? now();
      return runExclusive(async () => {
        const drafts = await listRaw();
        const imagePaths: string[] = [];
        for (const draft of drafts) {
          if (
            draft.status === QUICK_BOOK_DRAFT_STATUS.generating &&
            draft.updatedTime < timestamp - GENERATING_TIMEOUT_MS
          ) {
            await writeDraft({
              ...draft,
              status: QUICK_BOOK_DRAFT_STATUS.failed,
              errorText: GENERATING_TIMEOUT_ERROR,
              updatedTime: timestamp,
            });
            continue;
          }

          const isActive =
            draft.status === QUICK_BOOK_DRAFT_STATUS.generating ||
            draft.status === QUICK_BOOK_DRAFT_STATUS.pending;
          if (
            isActive &&
            draft.target.kind === 'local' &&
            options?.isLocalBookExisting
          ) {
            const exists = await options.isLocalBookExisting(
              draft.target.booksId,
            );
            if (!exists) {
              await writeDraft({
                ...draft,
                status: QUICK_BOOK_DRAFT_STATUS.failed,
                errorText: '目标账本已不存在',
                updatedTime: timestamp,
              });
              continue;
            }
          }

          const expiredDiscarded =
            draft.status === QUICK_BOOK_DRAFT_STATUS.discarded &&
            draft.updatedTime < timestamp - DISCARDED_RETENTION_MS;
          const expiredConfirmed =
            draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed &&
            draft.confirmedAt > 0 &&
            draft.confirmedAt < timestamp - CONFIRMED_RETENTION_MS;
          if (!expiredDiscarded && !expiredConfirmed) {
            continue;
          }
          await storage.removeItem(cacheKey(draft.id));
          if (draft.imagePath !== '') {
            imagePaths.push(draft.imagePath);
          }
        }
        return Array.from(new Set(imagePaths));
      });
    },
  };
}
