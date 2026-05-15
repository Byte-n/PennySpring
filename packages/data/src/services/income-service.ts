import { eq } from 'drizzle-orm'

import { REIMBURSABLE, RECORD_TYPE_SPECIAL_BEHAVIOR } from '../constants'
import { assets, records, recordWithRecord } from '../schema'
import {
  applyBalanceChange,
  computeBalanceChange,
  recalculateAbsorption,
  syncImages,
  syncRecordRelations,
  syncTags,
} from './helpers'
import type { CreateRecordInput, RecordRow, Tx, TypeRow } from './types'

function isAbsorptionBehavior(specialBehavior: string): boolean {
  return (
    specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption ||
    specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption
  )
}

export async function createIncome(tx: Tx, input: CreateRecordInput, typeRow: TypeRow): Promise<RecordRow> {
  const asset = await tx.select().from(assets).where(eq(assets.id, input.assetId)).get()
  if (!asset) throw new Error(`Asset not found: ${input.assetId}`)
  const charge = input.charge ?? 0
  const isAbsorption = isAbsorptionBehavior(typeRow.specialBehavior)
  const finalAmount = input.amount - charge

  const [inserted] = await tx
    .insert(records)
    .values({
      typeId: input.typeId,
      assetId: input.assetId,
      intoAssetId: 0,
      booksId: input.booksId,
      amount: input.amount,
      finalAmount,
      charge,
      remark: input.remark ?? '',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: input.recordTime,
    })
    .returning()

  const balanceChange = computeBalanceChange(asset, 'income', input.amount, charge)
  await applyBalanceChange(tx, input.assetId, balanceChange)

  if (isAbsorption && input.relatedRecordIds?.length) {
    await syncRecordRelations(tx, inserted.id, input.relatedRecordIds)
    for (const expenseId of input.relatedRecordIds) {
      await recalculateAbsorption(tx, expenseId)
    }
  }

  if (input.tagIds?.length) await syncTags(tx, inserted.id, input.tagIds)
  if (input.imagePaths?.length) await syncImages(tx, inserted.id, input.imagePaths)

  const result = await tx.select().from(records).where(eq(records.id, inserted.id)).get()
  return result!
}

export async function rollbackIncome(tx: Tx, record: RecordRow, typeRow: TypeRow) {
  const asset = await tx.select().from(assets).where(eq(assets.id, record.assetId)).get()
  if (!asset) throw new Error(`Asset not found: ${record.assetId}`)
  const reverseChange = -computeBalanceChange(asset, 'income', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, reverseChange)

  if (isAbsorptionBehavior(typeRow.specialBehavior)) {
    const links = await tx
      .select({ relatedRecordId: recordWithRecord.relatedRecordId })
      .from(recordWithRecord)
      .where(eq(recordWithRecord.recordId, record.id))

    await tx.delete(recordWithRecord).where(eq(recordWithRecord.recordId, record.id))

    for (const link of links) {
      await recalculateAbsorption(tx, link.relatedRecordId)
    }
  }
}

export async function applyIncome(tx: Tx, record: RecordRow, typeRow: TypeRow, relatedRecordIds?: number[]) {
  const asset = await tx.select().from(assets).where(eq(assets.id, record.assetId)).get()
  if (!asset) throw new Error(`Asset not found: ${record.assetId}`)
  const change = computeBalanceChange(asset, 'income', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, change)

  if (isAbsorptionBehavior(typeRow.specialBehavior) && relatedRecordIds?.length) {
    await syncRecordRelations(tx, record.id, relatedRecordIds)
    for (const expenseId of relatedRecordIds) {
      await recalculateAbsorption(tx, expenseId)
    }
  }
}
