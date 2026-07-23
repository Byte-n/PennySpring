import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { bookStorage } from './bookStorage'

const NETWORK_BOOK_STORE_KEY = 'pennyspring-network-books'

/**
 * 网络账本在本地持久化缓存中的最小引用：仅记录服务器地址与远程账本 id。
 * 完整账本信息在使用时通过 createRemoteApi(serverUrl).book.getById(bookId) 拉取拼凑。
 */
export type NetworkBookRef = { serverUrl: string; bookId: number }

interface NetworkBookStoreState {
  refs: NetworkBookRef[]
  addRef: (ref: NetworkBookRef) => void
  removeRef: (serverUrl: string, bookId: number) => void
  setRefs: (refs: NetworkBookRef[]) => void
}

interface PersistedNetworkBookStore {
  refs: NetworkBookRef[]
}

let rehydrateNetworkBooks = async (): Promise<void> => undefined

export const useNetworkBookStore = create<NetworkBookStoreState>()(
  persist(
    (set, get) => ({
      refs: [],
      addRef: (ref) => {
        const refs = get().refs
        const exists = refs.some(
          r => r.serverUrl === ref.serverUrl && r.bookId === ref.bookId,
        )
        if (exists) {
          return
        }
        set({ refs: [...refs, ref] })
      },
      removeRef: (serverUrl, bookId) => {
        set({
          refs: get().refs.filter(
            r => !(r.serverUrl === serverUrl && r.bookId === bookId),
          ),
        })
      },
      setRefs: (refs) => {
        set({ refs })
      },
    }),
    {
      name: NETWORK_BOOK_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): PersistedNetworkBookStore => ({
        refs: state.refs,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
)

rehydrateNetworkBooks = async (): Promise<void> => {
  await useNetworkBookStore.persist.rehydrate()
}

export { rehydrateNetworkBooks }

export function useNetworkBookRefs(): NetworkBookRef[] {
  return useNetworkBookStore(state => state.refs)
}
