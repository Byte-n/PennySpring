import { create } from 'zustand'
import { api, type BookRow } from '@pennyspring/data'

interface BookStore {
  currentBook: BookRow | null
  setCurrentBook: (book: BookRow) => void
  initializeBook: () => Promise<void>
}

export const useBookStore = create<BookStore>((set) => ({
  currentBook: null,
  setCurrentBook: (book) => {
    set({ currentBook: book })
  },

  initializeBook: async () => {
    try {
      const book = await api.book.getDefault()
      set({ currentBook: book })
    } catch (error) {
      throw error
    }
  },
}))
