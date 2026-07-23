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

interface BookStore {
  currentBook: BookEntry | null;
  currentBookRef: CurrentBookRef | null;
  setCurrentBook: (ref: CurrentBookRef, book: BookEntry) => void;
  initializeBook: () => Promise<void>;
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
      setCurrentBook: (ref, book) => {
        set({ currentBook: book, currentBookRef: ref });
      },

      initializeBook: async () => {
        await rehydrateBookStore();
        const { ref, book } = await getInitialBook(get().currentBookRef);
        set({ currentBook: book, currentBookRef: ref });
      },
    }),
    {
      name: BOOK_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): PersistedBookStore => ({
        currentBookRef: state.currentBookRef,
      }),
      // shape 由 { currentBook: BookRow } 变为 { currentBookRef }，旧版本数据直接丢弃
      migrate: (): PersistedBookStore => ({ currentBookRef: null }),
      skipHydration: true,
      version: 2,
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
