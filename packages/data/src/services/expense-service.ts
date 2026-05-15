import { eq } from 'drizzle-orm'

import { REIMBURSABLE } from '../constants'
import { assets, records } from '../schema'
import { applyBalanceChange, computeBalanceChange, syncImages, syncTags } from './helpers'
import type { CreateRecordInput, RecordRow, Tx } from './types'

export async function createExpense(tx: Tx, input: CreateRecordInput): Promise<RecordRow> {
  const asset = await tx.select().from(assets).where(eq(assets.id, input.assetId)).get()
  if (!asset) throw new Error(`Asset not found: ${input.assetId}`)
  const charge = input.charge ?? 0
  const finalAmount = input.amount + charge

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
      reimbursable: input.reimbursable ?? REIMBURSABLE.notReimbursable,
      recordTime: input.recordTime,
    })
    .returning()

  const balanceChange = computeBalanceChange(asset, 'expense', input.amount, charge)
  await applyBalanceChange(tx, input.assetId, balanceChange)

  if (input.tagIds?.length) await syncTags(tx, inserted.id, input.tagIds)
  if (input.imagePaths?.length) await syncImages(tx, inserted.id, input.imagePaths)

  return inserted
}

export async function rollbackExpense(tx: Tx, record: RecordRow) {
  const asset = await tx.select().from(assets).where(eq(assets.id, record.assetId)).get()
  if (!asset) throw new Error(`Asset not found: ${record.assetId}`)
  const reverseChange = -computeBalanceChange(asset, 'expense', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, reverseChange)
}

export async function applyExpense(tx: Tx, record: RecordRow) {
  const asset = await tx.select().from(assets).where(eq(assets.id, record.assetId)).get()
  if (!asset) throw new Error(`Asset not found: ${record.assetId}`)
  const change = computeBalanceChange(asset, 'expense', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, change)
}
