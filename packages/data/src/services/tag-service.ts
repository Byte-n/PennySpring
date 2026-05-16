import { count, eq } from 'drizzle-orm'

import { VISIBILITY } from '../constants'
import type { Database } from '../runtime'
import { tagWithRecord, tags } from '../schema'
import type { CreateTagInput, TagRow, Tx, UpdateTagInput } from './types'

function validateTagInput(input: CreateTagInput | UpdateTagInput): void {
  if (!input.name.trim()) {
    throw new Error('name is required')
  }
}

async function getTagRow(tx: Tx, id: number): Promise<TagRow> {
  const row = await tx.select().from(tags).where(eq(tags.id, id)).get()
  if (!row) {
    throw new Error(`Tag not found: ${id}`)
  }
  return row
}

export function createTag(db: Database, input: CreateTagInput): Promise<TagRow> {
  validateTagInput(input)

  return db.transaction(async (tx) => {
    const inserted = await tx.insert(tags)
      .values({
        name: input.name,
        icon: input.icon ?? '',
        invisible: input.invisible ?? VISIBILITY.visible,
      })
      .returning({ id: tags.id })

    const id = inserted[0]?.id
    if (!id) {
      throw new Error('Failed to create tag')
    }

    return getTagRow(tx, id)
  })
}

export function updateTag(db: Database, input: UpdateTagInput): Promise<TagRow> {
  validateTagInput(input)

  return db.transaction(async (tx) => {
    await getTagRow(tx, input.id)

    await tx.update(tags)
      .set({
        name: input.name,
        icon: input.icon ?? '',
        invisible: input.invisible ?? VISIBILITY.visible,
      })
      .where(eq(tags.id, input.id))

    return getTagRow(tx, input.id)
  })
}

export function deleteTag(db: Database, id: number): Promise<void> {
  return db.transaction(async (tx) => {
    const usedCountRow = await tx.select({ count: count() })
      .from(tagWithRecord)
      .where(eq(tagWithRecord.tagId, id))
      .get()

    if ((usedCountRow?.count ?? 0) > 0) {
      throw new Error(`Tag is in use: ${id}`)
    }

    await tx.delete(tags).where(eq(tags.id, id))
  })
}
