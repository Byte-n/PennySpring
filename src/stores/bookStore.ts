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
import { getServerToken, rehydrateNetworkBooks } from './networkBookStore';

const BOOK_STORE_KEY = 'pennyspring-book-store';

const remoteApiCache = new Map<string, Api>();

/**
 * 统一账本条目：kind 标记来源，其余字段等同 BookRow。
 * 不含 serverUrl——网络账本的 serverUrl 由 CurrentBookRef 持有。
 */
export type BookEntry = { kind: BookTypeValue } & BookRow;

/**
 * 当前账本的持久化引用：本地账本仅记 id，网络账本记 serverUrl + bookId。
 * 启动时由 ref 拉取完整 BookRow 并拼凑为内存态 BookEntry。
 */
export type CurrentBookRef =
  | { kind: 'local'; id: number }
  | { kind: 'remote'; serverUrl: string; bookId: number };

/**
 * 账本的稳定身份键：本地账本按 id，网络账本按服务器 + 远程 id。
 * 数据请求与视图依赖必须使用该键，不能只用数字 id——本地与网络账本可能同号。
 */
export function getBookKey(ref: CurrentBookRef | null): string | null {
  if (!ref) {
    return null;
  }
  return ref.kind === 'local'
    ? `local:${ref.id}`
    : `remote:${ref.serverUrl}:${ref.bookId}`;
}

/** 账本的数据身份：本地取 id，网络取远程 id。元信息未加载也可用。 */
export function getBookId(ref: CurrentBookRef | null): number | null {
  if (!ref) {
    return null;
  }
  return ref.kind === 'local' ? ref.id : ref.bookId;
}

export function getRemoteApi(
  serverUrl: string,
  token: string = getServerToken(serverUrl),
): Api {
  const cacheKey = `${serverUrl}\n${token}`;
  let api = remoteApiCache.get(cacheKey);
  if (!api) {
    api = createRemoteApi(serverUrl, { token });
    remoteApiCache.set(cacheKey, api);
  }
  return api;
}

function createApiForRef(ref: CurrentBookRef | null): Api {
  if (ref?.kind === 'remote') {
    return getRemoteApi(ref.serverUrl);
  }
  return localApi;
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
 * 失败时不自动回退，由 initializeBook 置错误态，用户手动切换账本。
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

export interface BookSessionHydration {
  ref: CurrentBookRef | null;
  /** 已恢复账本 ref，但仍需拉取账本元信息。 */
  needsMetadata: boolean;
}

interface BookStore {
  currentBook: BookEntry | null;
  currentBookRef: CurrentBookRef | null;
  /** 当前账本初始化状态；仅用于展示与后台任务节流，不参与导航门禁 */
  initStatus: InitStatus;
  setCurrentBook: (ref: CurrentBookRef, book: BookEntry) => void;
  /** 当前账本被删除或移除时清空选择，不自动回退到其他账本。 */
  clearCurrentBook: () => void;
  /**
   * 只做本地恢复：账本 ref 与网络令牌；没有 ref 时解析本地默认账本。
   * 不等待远程账本元信息，供初始屏快速放行。
   */
  hydrateBookSession: () => Promise<BookSessionHydration>;
  /** 按当前 ref 拉取账本元信息；失败保留 ref，供入口重试。 */
  loadCurrentBook: () => Promise<void>;
  /** 完整初始化：本地恢复 + 元信息加载。 */
  initializeBook: () => Promise<void>;
}

interface PersistedBookStore {
  currentBookRef: CurrentBookRef | null;
}

let rehydrateBookStore = async (): Promise<void> => undefined;

/** 初始化代次：用户手动切换账本或重新初始化时递增，在途结果自动作废。 */
let bookInitGeneration = 0;

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => {
      const hydrateSession = async (
        generation: number,
      ): Promise<BookSessionHydration> => {
        await rehydrateBookStore();
        // 网络账本令牌与账本引用同属设备级数据，初始化时一并恢复。
        try {
          await rehydrateNetworkBooks();
        } catch (error) {
          // 网络账本读取失败不应阻断本地账本启动。
          console.error('Network book rehydration failed:', error);
        }
        if (generation !== bookInitGeneration) {
          return { ref: get().currentBookRef, needsMetadata: false };
        }
        const persistedRef = get().currentBookRef;
        if (persistedRef) {
          set({ initStatus: 'loading' });
          return { ref: persistedRef, needsMetadata: true };
        }
        // 首次使用：本地默认账本同时提供身份与元信息。
        const { ref, book } = await getLocalDefault();
        if (generation !== bookInitGeneration) {
          return { ref: get().currentBookRef, needsMetadata: false };
        }
        set({
          currentBook: book,
          currentBookRef: ref,
          initStatus: 'success',
        });
        return { ref, needsMetadata: false };
      };

      const loadMetadata = async (generation: number): Promise<void> => {
        const ref = get().currentBookRef;
        if (!ref) {
          set({ currentBook: null, initStatus: 'success' });
          return;
        }
        set({ initStatus: 'loading' });
        try {
          const { ref: loadedRef, book } = await getInitialBook(ref);
          if (generation !== bookInitGeneration) {
            return;
          }
          set({
            currentBook: book,
            currentBookRef: loadedRef,
            initStatus: 'success',
          });
        } catch (error) {
          if (generation !== bookInitGeneration) {
            return;
          }
          // 保留 currentBookRef：瞬时失败不能丢掉用户的选择，入口据此提供重试。
          set({
            currentBook: null,
            initStatus: 'error',
          });
          throw error;
        }
      };

      return {
        currentBook: null,
        currentBookRef: null,
        initStatus: 'idle',

        setCurrentBook: (ref, book) => {
          bookInitGeneration += 1;
          set({
            currentBook: book,
            currentBookRef: ref,
            initStatus: 'success',
          });
        },

        clearCurrentBook: () => {
          bookInitGeneration += 1;
          set({
            currentBook: null,
            currentBookRef: null,
            initStatus: 'success',
          });
        },

        hydrateBookSession: async () => {
          const generation = (bookInitGeneration += 1);
          try {
            return await hydrateSession(generation);
          } catch (error) {
            if (generation !== bookInitGeneration) {
              return { ref: get().currentBookRef, needsMetadata: false };
            }
            set({ currentBook: null, initStatus: 'error' });
            throw error;
          }
        },

        loadCurrentBook: async () => {
          const generation = (bookInitGeneration += 1);
          await loadMetadata(generation);
        },

        initializeBook: async () => {
          const generation = (bookInitGeneration += 1);
          try {
            const { needsMetadata } = await hydrateSession(generation);
            if (generation !== bookInitGeneration) {
              return;
            }
            if (needsMetadata) {
              await loadMetadata(generation);
            }
          } catch (error) {
            if (generation !== bookInitGeneration) {
              return;
            }
            set({ currentBook: null, initStatus: 'error' });
            throw error;
          }
        },
      };
    },
    {
      name: BOOK_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): PersistedBookStore => ({
        currentBookRef: state.currentBookRef,
      }),
      // shape 由 { currentBook: BookRow } 变为 { currentBookRef }，旧版本数据直接丢弃
      migrate: (
        persistedState: unknown,
        version: number,
      ): PersistedBookStore => {
        // 版本 < 2 时，旧数据结构不兼容，清空
        if (version < 2) {
          return { currentBookRef: null };
        }
        // 版本 >= 2，保持原数据
        return persistedState as PersistedBookStore;
      },
      skipHydration: true,
      version: 2,
    },
  ),
);

rehydrateBookStore = async (): Promise<void> => {
  await useBookStore.persist.rehydrate();
};

export function useGlobalApi(): Api {
  const ref = useBookStore(state => state.currentBookRef);
  return createApiForRef(ref);
}

/**
 * 当前账本的数据身份。只依赖 ref，账本元信息加载期间也可直接发起数据请求。
 */
export function useCurrentBookId(): number | null {
  return useBookStore(state => getBookId(state.currentBookRef));
}

/** 当前账本的稳定身份键；切账本时变化，元信息加载完成不重复触发请求。 */
export function useBookKey(): string | null {
  return useBookStore(state => getBookKey(state.currentBookRef));
}

export function getGlobalApi(): Api {
  return createApiForRef(useBookStore.getState().currentBookRef);
}
