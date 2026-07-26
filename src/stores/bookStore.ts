import { create } from 'zustand';
import {
  type Api,
  BOOK_TYPE,
  type BookRow,
  type BookTypeValue,
  createRemoteApi,
  localApi,
} from '@pennyspring/api';
import { createJSONStorage, persist } from 'zustand/middleware';

import { bookStorage } from './bookStorage';

const BOOK_STORE_KEY = 'pennyspring-book-store'

const remoteApiCache = new Map<string, Api>()

/**
 * 统一账本条目：kind 标记来源，其余字段等同 BookRow。
 * 不含 serverUrl——网络账本的 serverUrl 由 CurrentBookRef 持有。
 */
export type BookEntry = { kind: BookTypeValue } & BookRow

/**
 * 当前账本的持久化引用：本地账本仅记 id，网络账本记 serverUrl + bookId。
 * 启动时由 ref 拉取完整 BookRow 并拼凑为内存态 BookEntry。
 */
export type CurrentBookRef =
  | { kind: 'local'; id: number }
  | { kind: 'remote'; serverUrl: string; bookId: number }

export function getRemoteApi(serverUrl: string): Api {
  let api = remoteApiCache.get(serverUrl)
  if (!api) {
    api = createRemoteApi(serverUrl)
    remoteApiCache.set(serverUrl, api)
  }
  return api
}

function createApiForRef(ref: CurrentBookRef | null): Api {
  if (ref?.kind === 'remote') {
    return getRemoteApi(ref.serverUrl)
  }
  return localApi
}

function toLocalEntry(row: BookRow): BookEntry {
  return { kind: BOOK_TYPE.local, ...row };
}

function toRemoteEntry(row: BookRow): BookEntry {
  return { kind: BOOK_TYPE.remote, ...row };
}

async function getLocalDefault(): Promise<{
  ref: CurrentBookRef;
  book: BookEntry;
}> {
  const row = await localApi.book.getDefault();
  return { ref: { kind: 'local', id: row.id }, book: toLocalEntry(row) };
}

/**
 * 由持久化 ref 拉取完整账本信息并拼凑为 BookEntry。
 * 网络账本拉取失败时回退本地默认账本，保证应用可用。
 */
async function getInitialBook(
  ref: CurrentBookRef | null,
): Promise<{ ref: CurrentBookRef; book: BookEntry }> {
  if (ref?.kind === 'remote') {
    const row = await createApiForRef(ref).book.getById(ref.bookId);
    return { ref, book: toRemoteEntry(row) };
  }
  if (ref?.kind === 'local') {
    const row = await localApi.book.getById(ref.id);
    return { ref, book: toLocalEntry(row) };
  }
  return getLocalDefault();
}

type InitStatus = 'idle' | 'loading' | 'success' | 'error';

interface BookStore {
  currentBook: BookEntry | null;
  currentBookRef: CurrentBookRef | null;
  initStatus: InitStatus;
  initError: Error | null;
  setCurrentBook: (ref: CurrentBookRef, book: BookEntry) => void;
  initializeBook: () => Promise<void>;
  resetInitStatus: () => void;
}

interface PersistedBookStore {
  currentBookRef: CurrentBookRef | null;
}

let rehydrateBookStore = async (): Promise<void> => undefined

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      currentBook: null,
      currentBookRef: null,
      initStatus: 'idle',
      initError: null,

      setCurrentBook: (ref, book) => {
        set({ currentBook: book, currentBookRef: ref });
      },

      initializeBook: async () => {
        set({ initStatus: 'loading', initError: null });
        try {
          console.log('[BookStore] before rehydrate - currentBookRef:', get().currentBookRef);
          await rehydrateBookStore();
          const persistedRef = get().currentBookRef;
          console.log('[BookStore] after rehydrate - persistedRef:', persistedRef);
          const { ref, book } = await getInitialBook(persistedRef);
          console.log('[BookStore] initializeBook - success:', { ref, bookName: book.name });
          set({ currentBook: book, currentBookRef: ref, initStatus: 'success' });
        } catch (error) {
          console.log('[BookStore] initializeBook - error:', error);
          set({ initStatus: 'error', initError: error as Error });
          throw error;
        }
      },

      resetInitStatus: () => {
        set({ initStatus: 'idle', initError: null });
      },
    }),
    {
      name: BOOK_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): PersistedBookStore => ({
        currentBookRef: state.currentBookRef,
      }),
      // shape 由 { currentBook: BookRow } 变为 { currentBookRef }，旧版本数据直接丢弃
      migrate: (persistedState: unknown, version: number): PersistedBookStore => {
        console.log('[BookStore] migrate called - version:', version, 'persistedState:', persistedState);
        // 版本 < 2 时，旧数据结构不兼容，清空
        if (version < 2) {
          return { currentBookRef: null };
        }
        // 版本 >= 2，保持原数据
        return persistedState as PersistedBookStore;
      },
      skipHydration: true,
      version: 2,
      // 只在 rehydrate 之后才持久化，避免初始状态覆盖存储
      onRehydrateStorage: () => (state) => {
        console.log('[BookStore] onRehydrateStorage - state:', state?.currentBookRef);
      },
    },
  ),
);

rehydrateBookStore = async (): Promise<void> => {
  await useBookStore.persist.rehydrate()
}

export function useGlobalApi(): Api {
  const ref = useBookStore(state => state.currentBookRef);
  return createApiForRef(ref);
}

export function getGlobalApi(): Api {
  return createApiForRef(useBookStore.getState().currentBookRef);
}
