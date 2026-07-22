import { create } from 'zustand'
import {
  BOOK_TYPE,
  createRemoteApi,
  localApi,
  type Api,
  type BookRow,
} from '@pennyspring/api'
import { createJSONStorage, persist } from 'zustand/middleware'
import { bookStorage } from './bookStorage'

const BOOK_STORE_KEY = 'pennyspring-book-store'

const remoteApiCache = new Map<string, Api>()

function createApiForBook(book: BookRow | null): Api {
  if (book && book.type === BOOK_TYPE.remote && book.remoteUrl) {
    let api = remoteApiCache.get(book.remoteUrl)
    if (!api) {
      api = createRemoteApi(book.remoteUrl)
      remoteApiCache.set(book.remoteUrl, api)
    }
    return api
  }
  return localApi
}

interface BookStore {
  currentBook: BookRow | null
  setCurrentBook: (book: BookRow) => void
  initializeBook: () => Promise<void>
}

interface PersistedBookStore {
  currentBook: BookRow | null
}

let rehydrateBookStore = async (): Promise<void> => undefined

async function getInitialBook(storedBook: BookRow | null): Promise<BookRow> {
  if (storedBook) {
    try {
      const api = createApiForBook(storedBook)
      return await api.book.getById(storedBook.id)
    } catch {
      return localApi.book.getDefault()
    }
  }

  return localApi.book.getDefault()
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      currentBook: null,
      setCurrentBook: (book) => {
        set({ currentBook: book })
      },

      initializeBook: async () => {
        await rehydrateBookStore()
        const book = await getInitialBook(get().currentBook)
        set({ currentBook: book })
      },
    }),
    {
      name: BOOK_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): PersistedBookStore => ({
        currentBook: state.currentBook,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
)

rehydrateBookStore = async (): Promise<void> => {
  await useBookStore.persist.rehydrate()
}

export function useGlobalApi(): Api {
  const currentBook = useBookStore(state => state.currentBook)
  return createApiForBook(currentBook)
}

export function getGlobalApi(): Api {
  return createApiForBook(useBookStore.getState().currentBook)
}
