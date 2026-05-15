import { eq } from 'drizzle-orm'

import { REIMBURSABLE } from '../constants'
import { assets, records } from '../schema'
import { applyBalanceChange, computeBalanceChange, syncImages, syncTags } from './helpers'
import type { CreateRecordInput, RecordRow, Tx } from './types'

export async function createTransfer(tx: Tx, input: CreateRecordInput): Promise<RecordRow> {
  const fromAsset = await tx.select().from(assets).where(eq(assets.id, input.assetId)).get()
  if (!fromAsset) throw new Error(`Asset not found: ${input.assetId}`)
  const toAsset = await tx.select().from(assets).where(eq(assets.id, input.intoAssetId!)).get()
  if (!toAsset) throw new Error(`Asset not found: ${input.intoAssetId}`)
  const charge = input.charge ?? 0
  const finalAmount = charge

  const [inserted] = await tx
    .insert(records)
    .values({
      typeId: input.typeId,
      assetId: input.assetId,
      intoAssetId: input.intoAssetId!,
      booksId: input.booksId,
      amount: input.amount,
      finalAmount,
      charge,
      remark: input.remark ?? '',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: input.recordTime,
    })
    .returning()

  const outChange = computeBalanceChange(fromAsset, 'transfer_out', input.amount, charge)
  await applyBalanceChange(tx, input.assetId, outChange)

  const inChange = computeBalanceChange(toAsset, 'transfer_in', input.amount, charge)
  await applyBalanceChange(tx, input.intoAssetId!, inChange)

  if (input.tagIds?.length) await syncTags(tx, inserted.id, input.tagIds)
  if (input.imagePaths?.length) await syncImages(tx, inserted.id, input.imagePaths)

  return inserted
}

export async function rollbackTransfer(tx: Tx, record: RecordRow) {
  const fromAsset = await tx.select().from(assets).where(eq(assets.id, record.assetId)).get()
  if (!fromAsset) throw new Error(`Asset not found: ${record.assetId}`)
  const toAsset = await tx.select().from(assets).where(eq(assets.id, record.intoAssetId)).get()
  if (!toAsset) throw new Error(`Asset not found: ${record.intoAssetId}`)

  const reverseOut = -computeBalanceChange(fromAsset, 'transfer_out', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, reverseOut)

  const reverseIn = -computeBalanceChange(toAsset, 'transfer_in', record.amount, record.charge)
  await applyBalanceChange(tx, record.intoAssetId, reverseIn)
}

export async function applyTransfer(tx: Tx, record: RecordRow) {
  const fromAsset = await tx.select().from(assets).where(eq(assets.id, record.assetId)).get()
  if (!fromAsset) throw new Error(`Asset not found: ${record.assetId}`)
  const toAsset = await tx.select().from(assets).where(eq(assets.id, record.intoAssetId)).get()
  if (!toAsset) throw new Error(`Asset not found: ${record.intoAssetId}`)

  const outChange = computeBalanceChange(fromAsset, 'transfer_out', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, outChange)

  const inChange = computeBalanceChange(toAsset, 'transfer_in', record.amount, record.charge)
  await applyBalanceChange(tx, record.intoAssetId, inChange)
}
