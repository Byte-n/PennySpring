import { and, eq, gte, lt } from 'drizzle-orm'

import { VISIBILITY } from '../constants'
import type { Database } from '../types'
import { records, tagWithRecord, tags } from '../schema'
import type { CreateTagInput, RecordTimeRange, TagRow, Tx, UpdateTagInput } from './types'

export async function getAllTags(
  db: Database,
  booksId: number,
  range?: RecordTimeRange,
): Promise<TagRow[]> {
  if (!range) {
    return db.select().from(tags).where(eq(tags.booksId, booksId)).all()
  }

  return db
    .selectDistinct({
      id: tags.id,
      booksId: tags.booksId,
      name: tags.name,
      invisible: tags.invisible,
      icon: tags.icon,
      createdTime: tags.createdTime,
      updatedTime: tags.updatedTime,
    })
    .from(tags)
    .innerJoin(tagWithRecord, eq(tagWithRecord.tagId, tags.id))
    .innerJoin(records, eq(tagWithRecord.recordId, records.id))
    .where(and(
      eq(tags.booksId, booksId),
      eq(records.booksId, booksId),
      gte(records.recordTime, range.startTime),
      lt(records.recordTime, range.endTime),
    ))
    .all()
}

function validateTagInput(input: CreateTagInput | UpdateTagInput): void {
  if (!input.name.trim()) {
    throw new Error('name is required')
  }
}

async function getTagRow(tx: Tx, id: number, booksId: number): Promise<TagRow> {
  const row = await tx.select().from(tags).where(eq(tags.id, id)).get()
  if (!row) {
    throw new Error(`Tag not found: ${id}`)
  }
  if (row.booksId !== booksId) {
    throw new Error(`Tag ${id} does not belong to book ${booksId}`)
  }
  return row
}

export function createTag(db: Database, input: CreateTagInput): Promise<TagRow> {
  validateTagInput(input)

  return db.transaction(async (tx) => {
    const inserted = await tx.insert(tags)
      .values({
        booksId: input.booksId,
        name: input.name,
        icon: input.icon ?? '',
        invisible: input.invisible ?? VISIBILITY.visible,
      })
      .returning({ id: tags.id })

    const id = inserted[0]?.id
    if (!id) {
      throw new Error('Failed to create tag')
    }

    return getTagRow(tx, id, input.booksId)
  })
}

export function updateTag(db: Database, input: UpdateTagInput): Promise<TagRow> {
  validateTagInput(input)

  return db.transaction(async (tx) => {
    await getTagRow(tx, input.id, input.booksId)

    await tx.update(tags)
      .set({
        name: input.name,
        icon: input.icon ?? '',
        invisible: input.invisible ?? VISIBILITY.visible,
      })
      .where(eq(tags.id, input.id))

    return getTagRow(tx, input.id, input.booksId)
  })
}

export function deleteTag(db: Database, id: number, booksId: number): Promise<void> {
  return db.transaction(async (tx) => {
    await getTagRow(tx, id, booksId)

    await tx.delete(tagWithRecord).where(eq(tagWithRecord.tagId, id))
    await tx.delete(tags).where(eq(tags.id, id))
  })
}
