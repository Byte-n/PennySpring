import { Storage } from '@op-engineering/op-sqlite';
import type { StateStorage } from 'zustand/middleware';

const sqliteStorage = new Storage({});

export const bookStorage: StateStorage<Promise<void>> = {
  getItem: async key => (await sqliteStorage.getItem(key)) ?? null,
  setItem: async (key, value) => {
    await sqliteStorage.setItem(key, value);
  },
  removeItem: async key => {
    await sqliteStorage.removeItem(key);
  },
};
