import { create } from 'zustand'
import { localApi, type BookRow } from '@pennyspring/api'
import { createJSONStorage, persist } from 'zustand/middleware'
import { bookStorage } from './bookStorage'

const BOOK_STORE_KEY = 'pennyspring-book-store'

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
      return await localApi.book.getById(storedBook.id)
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
