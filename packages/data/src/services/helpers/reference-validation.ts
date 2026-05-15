import { eq, inArray } from 'drizzle-orm'

import { assets, books, tags } from '../../schema'
import type { AssetRow, Tx } from '../types'

type ForeignKeyValue = number | undefined
type KnownForeignKeyName = 'assetId' | 'booksId' | 'intoAssetId' | 'typeId'
type KnownForeignKey<TSource> = {
  [TKey in keyof TSource]-?: TKey extends KnownForeignKeyName
    ? TSource[TKey] extends ForeignKeyValue
      ? TKey
      : never
    : never
}[keyof TSource]
type AssetForeignKey<TSource> = Extract<KnownForeignKey<TSource>, 'assetId' | 'intoAssetId'>
type BooksForeignKey<TSource> = Extract<KnownForeignKey<TSource>, 'booksId'>

export function getRequiredForeignKey<TSource, TKey extends KnownForeignKey<TSource>>(
  source: TSource,
  key: TKey
): number {
  const value = source[key] as ForeignKeyValue
  if (value === undefined || value === 0) {
    throw new Error(`${String(key)} is required`)
  }

  return value
}

function getOptionalForeignKey<TSource, TKey extends KnownForeignKey<TSource>>(
  source: TSource,
  key: TKey
): number | undefined {
  const value = source[key] as ForeignKeyValue
  if (value === undefined || value === 0) return undefined

  return value
}

export function compactForeignKeys(values: number[] | undefined): number[] {
  if (!values?.length) return []

  return Array.from(new Set(values.filter((value) => value !== 0)))
}

export async function validateBookExists<TSource>(
  tx: Tx,
  source: TSource,
  booksKey: BooksForeignKey<TSource>
): Promise<void> {
  const requiredBooksId = getRequiredForeignKey(source, booksKey)
  const row = await tx
    .select({ id: books.id })
    .from(books)
    .where(eq(books.id, requiredBooksId))
    .get()

  if (!row) throw new Error(`Books not found: ${requiredBooksId}`)
}

export async function getAssetForBooks<
  TSource,
  TAssetKey extends AssetForeignKey<TSource>,
  TBooksKey extends BooksForeignKey<TSource>,
>(
  tx: Tx,
  source: TSource,
  assetKey: TAssetKey,
  booksKey: TBooksKey
): Promise<AssetRow> {
  const requiredAssetId = getRequiredForeignKey(source, assetKey)
  const requiredBooksId = getRequiredForeignKey(source, booksKey)
  const asset = await tx.select().from(assets).where(eq(assets.id, requiredAssetId)).get()

  if (!asset) throw new Error(`Asset not found: ${requiredAssetId}`)
  if (asset.booksId !== requiredBooksId) {
    throw new Error(`Asset ${requiredAssetId} does not belong to books ${requiredBooksId}`)
  }

  return asset
}

export async function getOptionalAssetForBooks<
  TSource,
  TAssetKey extends AssetForeignKey<TSource>,
  TBooksKey extends BooksForeignKey<TSource>,
>(
  tx: Tx,
  source: TSource,
  assetKey: TAssetKey,
  booksKey: TBooksKey
): Promise<AssetRow | undefined> {
  const optionalAssetId = getOptionalForeignKey(source, assetKey)
  if (optionalAssetId === undefined) return undefined

  const requiredBooksId = getRequiredForeignKey(source, booksKey)
  const asset = await tx.select().from(assets).where(eq(assets.id, optionalAssetId)).get()

  if (!asset) throw new Error(`Asset not found: ${optionalAssetId}`)
  if (asset.booksId !== requiredBooksId) {
    throw new Error(`Asset ${optionalAssetId} does not belong to books ${requiredBooksId}`)
  }

  return asset
}

export async function validateTagIdsExist(tx: Tx, tagIds: number[] | undefined): Promise<number[]> {
  const requiredTagIds = compactForeignKeys(tagIds)
  if (requiredTagIds.length === 0) return []

  const rows = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(inArray(tags.id, requiredTagIds))

  const existingIds = new Set(rows.map((row) => row.id))
  const missingTagId = requiredTagIds.find((tagId) => !existingIds.has(tagId))

  if (missingTagId !== undefined) throw new Error(`Tag not found: ${missingTagId}`)

  return requiredTagIds
}
