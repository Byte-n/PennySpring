import { count, eq } from 'drizzle-orm'

import { assets, books } from '../schema'
import type { Database } from '../runtime'
import type { BookRow, CreateBookInput, Tx, UpdateBookInput } from './types'

function validateBookInput(input: CreateBookInput | UpdateBookInput): void {
  if (!input.name.trim()) {
    throw new Error('账本名称不能为空')
  }
}

async function getBookRow(tx: Tx, id: number): Promise<BookRow> {
  const row = await tx.select().from(books).where(eq(books.id, id)).get()
  if (!row) {
    throw new Error(`账本不存在: ${id}`)
  }
  return row
}

export async function getAllBooks(db: Database): Promise<BookRow[]> {
  return db.select().from(books).all()
}

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

export function createBook(db: Database, input: CreateBookInput): Promise<BookRow> {
  validateBookInput(input)
  return db.transaction(async (tx) => {
    const inserted = await tx.insert(books).values({
      name: input.name,
      description: input.description ?? '',
    }).returning({ id: books.id })
    const id = inserted[0]?.id
    if (!id) throw new Error('创建账本失败')
    return getBookRow(tx, id)
  })
}

export function updateBook(db: Database, input: UpdateBookInput): Promise<BookRow> {
  validateBookInput(input)
  return db.transaction(async (tx) => {
    await getBookRow(tx, input.id)
    await tx.update(books).set({
      name: input.name,
      description: input.description ?? '',
    }).where(eq(books.id, input.id))
    return getBookRow(tx, input.id)
  })
}

export function deleteBook(db: Database, id: number): Promise<void> {
  return db.transaction(async (tx) => {
    const assetCount = await tx.select({ count: count() })
      .from(assets).where(eq(assets.booksId, id)).get()
    if ((assetCount?.count ?? 0) > 0) {
      throw new Error(`账本下存在资产,无法删除: ${id}`)
    }
    await tx.delete(books).where(eq(books.id, id))
  })
}
