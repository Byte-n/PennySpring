import { Storage } from '@op-engineering/op-sqlite';
import type { StateStorage } from 'zustand/middleware';

const sqliteStorage = new Storage({});

let shouldSkipWrite = true;

export const bookStorage: StateStorage<Promise<void>> = {
  getItem: async key => {
    const value = (await sqliteStorage.getItem(key)) ?? null;
    // 首次 getItem 后允许写入
    shouldSkipWrite = false;
    return value;
  },
  setItem: async (key, value) => {
    if (shouldSkipWrite) {
      return;
    }
    await sqliteStorage.setItem(key, value);
  },
  removeItem: async key => {
    await sqliteStorage.removeItem(key);
  },
};
