import { Storage } from '@op-engineering/op-sqlite';

import {
  createQuickBookDraftCache,
  type DraftCacheStorage,
} from './draftCache';

export type { QuickBookDraftRecord } from './draftCache';

const storage = new Storage({});

const draftCacheStorage: DraftCacheStorage = {
  getItem: key => storage.getItem(key),
  setItem: (key, value) => storage.setItem(key, value),
  removeItem: key => storage.removeItem(key),
  getAllKeys: async () => {
    const keys = await Promise.resolve(storage.getAllKeys());
    return keys.map(String);
  },
};

export const quickBookDraftCache = createQuickBookDraftCache(draftCacheStorage);
