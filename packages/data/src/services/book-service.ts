import { eq } from 'drizzle-orm'

import { books } from '../schema'
import type { Database } from '../runtime'
import type { BookRow } from './types'

export async function getDefaultBook(db: Database): Promise<BookRow> {
  const book = await db.select().from(books).limit(1).get()
  if (!book) {
    throw new Error('未找到默认账本')
  }
  return book
}

export async function getBookById(db: Database, id: number): Promise<BookRow> {
  const book = await db.select().from(books).where(eq(books.id, id)).get()
  if (!book) {
    throw new Error(`账本不存在: ${id}`)
  }
  return book
}
