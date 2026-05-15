import { and, eq, inArray } from 'drizzle-orm'

import { imageWithRelated, recordWithRecord, tagWithRecord } from '../../schema'
import type { Tx } from '../types'

export async function syncTags(tx: Tx, recordId: number, tagIds: number[]) {
  const existing = await tx
    .select({ tagId: tagWithRecord.tagId })
    .from(tagWithRecord)
    .where(eq(tagWithRecord.recordId, recordId))

  const existingIds = existing.map((r) => r.tagId)
  const toAdd = tagIds.filter((id) => !existingIds.includes(id))
  const toRemove = existingIds.filter((id) => !tagIds.includes(id))

  if (toRemove.length > 0) {
    await tx.delete(tagWithRecord)
      .where(and(eq(tagWithRecord.recordId, recordId), inArray(tagWithRecord.tagId, toRemove)))
  }
  for (const tagId of toAdd) {
    await tx.insert(tagWithRecord).values({ recordId, tagId })
  }
}

export async function syncImages(tx: Tx, recordId: number, imagePaths: string[]) {
  const existing = await tx
    .select({ imagePath: imageWithRelated.imagePath })
    .from(imageWithRelated)
    .where(eq(imageWithRelated.recordId, recordId))

  const existingPaths = existing.map((r) => r.imagePath)
  const toAdd = imagePaths.filter((p) => !existingPaths.includes(p))
  const toRemove = existingPaths.filter((p) => !imagePaths.includes(p))

  if (toRemove.length > 0) {
    await tx.delete(imageWithRelated)
      .where(and(eq(imageWithRelated.recordId, recordId), inArray(imageWithRelated.imagePath, toRemove)))
  }
  for (const imagePath of toAdd) {
    await tx.insert(imageWithRelated).values({ recordId, imagePath })
  }
}

export async function syncRecordRelations(tx: Tx, recordId: number, relatedRecordIds: number[]) {
  const existing = await tx
    .select({ relatedRecordId: recordWithRecord.relatedRecordId })
    .from(recordWithRecord)
    .where(eq(recordWithRecord.recordId, recordId))

  const existingIds = existing.map((r) => r.relatedRecordId)
  const toAdd = relatedRecordIds.filter((id) => !existingIds.includes(id))
  const toRemove = existingIds.filter((id) => !relatedRecordIds.includes(id))

  if (toRemove.length > 0) {
    await tx.delete(recordWithRecord)
      .where(and(eq(recordWithRecord.recordId, recordId), inArray(recordWithRecord.relatedRecordId, toRemove)))
  }
  for (const relatedRecordId of toAdd) {
    await tx.insert(recordWithRecord).values({ recordId, relatedRecordId })
  }
}

export async function deleteAllJunctions(tx: Tx, recordId: number) {
  await tx.delete(tagWithRecord).where(eq(tagWithRecord.recordId, recordId))
  await tx.delete(imageWithRelated).where(eq(imageWithRelated.recordId, recordId))
  await tx.delete(recordWithRecord).where(eq(recordWithRecord.recordId, recordId))
  await tx.delete(recordWithRecord).where(eq(recordWithRecord.relatedRecordId, recordId))
}
