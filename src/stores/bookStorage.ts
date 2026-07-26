import { Storage } from '@op-engineering/op-sqlite';
import type { StateStorage } from 'zustand/middleware';

const sqliteStorage = new Storage({});

let shouldSkipWrite = true;

export const bookStorage: StateStorage<Promise<void>> = {
  getItem: async key => {
    const value = (await sqliteStorage.getItem(key)) ?? null;
    console.log('[bookStorage] getItem:', key, '→', value);
    // 首次 getItem 后允许写入
    shouldSkipWrite = false;
    return value;
  },
  setItem: async (key, value) => {
    if (shouldSkipWrite) {
      console.log('[bookStorage] setItem SKIPPED (before first getItem):', key);
      return;
    }
    console.log('[bookStorage] setItem:', key, '→', value);
    await sqliteStorage.setItem(key, value);
  },
  removeItem: async key => {
    console.log('[bookStorage] removeItem:', key);
    await sqliteStorage.removeItem(key);
  },
};
