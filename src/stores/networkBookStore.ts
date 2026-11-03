import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  mergeNetworkBooks,
  type NetworkBookMergeResult,
  type NetworkBooksSnapshot,
} from '../features/transfer/networkBooks';
import { bookStorage } from './bookStorage';

const NETWORK_BOOK_STORE_KEY = 'pennyspring-network-books';

/**
 * 网络账本在本地持久化缓存中的最小引用：仅记录服务器地址与远程账本 id。
 * 完整账本信息在使用时通过 createRemoteApi(serverUrl).book.getById(bookId) 拉取拼凑。
 */
export type NetworkBookRef = { serverUrl: string; bookId: number };

/** 设备级的服务器访问令牌，按服务器地址索引；同一服务器的所有账本共享。 */
export type ServerTokenMap = Record<string, string>;

interface NetworkBookStoreState {
  refs: NetworkBookRef[];
  tokens: ServerTokenMap;
  addRef: (ref: NetworkBookRef) => void;
  removeRef: (serverUrl: string, bookId: number) => void;
  setRefs: (refs: NetworkBookRef[]) => void;
  setServerToken: (serverUrl: string, token: string) => void;
  mergeSnapshot: (snapshot: NetworkBooksSnapshot) => NetworkBookMergeResult;
}

interface PersistedNetworkBookStore {
  refs: NetworkBookRef[];
  tokens: ServerTokenMap;
}

let rehydrateNetworkBooks = async (): Promise<void> => undefined;

export const useNetworkBookStore = create<NetworkBookStoreState>()(
  persist(
    (set, get) => ({
      refs: [],
      tokens: {},
      addRef: ref => {
        const refs = get().refs;
        const exists = refs.some(
          r => r.serverUrl === ref.serverUrl && r.bookId === ref.bookId,
        );
        if (exists) {
          return;
        }
        set({ refs: [...refs, ref] });
      },
      removeRef: (serverUrl, bookId) => {
        set({
          refs: get().refs.filter(
            r => !(r.serverUrl === serverUrl && r.bookId === bookId),
          ),
        });
      },
      setRefs: refs => {
        set({ refs });
      },
      setServerToken: (serverUrl, token) => {
        if (!serverUrl || !token) {
          return;
        }
        set({ tokens: { ...get().tokens, [serverUrl]: token } });
      },
      mergeSnapshot: snapshot => {
        const merged = mergeNetworkBooks(
          { refs: get().refs, tokens: get().tokens },
          snapshot,
        );
        set({ refs: merged.refs, tokens: merged.tokens });
        return merged;
      },
    }),
    {
      name: NETWORK_BOOK_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): PersistedNetworkBookStore => ({
        refs: state.refs,
        tokens: state.tokens,
      }),
      // 版本 1 没有令牌，保留已缓存的网络账本引用，等待用户重新录入令牌
      migrate: (
        persistedState: unknown,
        version: number,
      ): PersistedNetworkBookStore => {
        if (version < 2) {
          const legacy = persistedState as { refs?: NetworkBookRef[] } | null;
          return { refs: legacy?.refs ?? [], tokens: {} };
        }
        return persistedState as PersistedNetworkBookStore;
      },
      skipHydration: true,
      version: 2,
    },
  ),
);

rehydrateNetworkBooks = async (): Promise<void> => {
  await useNetworkBookStore.persist.rehydrate();
};

export { rehydrateNetworkBooks };

export function useNetworkBookRefs(): NetworkBookRef[] {
  return useNetworkBookStore(state => state.refs);
}

export function useServerToken(serverUrl: string | undefined): string {
  return useNetworkBookStore(state =>
    serverUrl ? (state.tokens[serverUrl] ?? '') : '',
  );
}

export function getServerToken(serverUrl: string): string {
  return useNetworkBookStore.getState().tokens[serverUrl] ?? '';
}
