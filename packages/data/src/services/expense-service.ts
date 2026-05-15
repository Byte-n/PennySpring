import { records } from '../schema'
import {
  applyBalanceChange,
  computeBalanceChange,
  getOptionalAssetForBooks,
  syncImages,
  syncTags,
} from './helpers'
import type { CreateCashflowRecordInput, RecordRow, Tx } from './types'

export async function createExpense(tx: Tx, input: CreateCashflowRecordInput): Promise<RecordRow> {
  const asset = await getOptionalAssetForBooks(tx, input, 'assetId', 'booksId')
  const charge = input.charge ?? 0
  const finalAmount = input.amount + charge

  const [inserted] = await tx
    .insert(records)
    .values({
      typeId: input.typeId,
      assetId: input.assetId ?? 0,
      intoAssetId: 0,
      booksId: input.booksId,
      amount: input.amount,
      finalAmount,
      charge,
      remark: input.remark ?? '',
      reimbursable: input.reimbursable,
      recordTime: input.recordTime,
    })
    .returning()

  if (asset) {
    const balanceChange = computeBalanceChange(asset, 'expense', input.amount, charge)
    await applyBalanceChange(tx, asset.id, balanceChange)
  }

  if (input.tagIds?.length) await syncTags(tx, inserted.id, input.tagIds)
  if (input.imagePaths?.length) await syncImages(tx, inserted.id, input.imagePaths)

  return inserted
}

export async function rollbackExpense(tx: Tx, record: RecordRow) {
  const asset = await getOptionalAssetForBooks(tx, record, 'assetId', 'booksId')
  if (!asset) return

  const reverseChange = -computeBalanceChange(asset, 'expense', record.amount, record.charge)
  await applyBalanceChange(tx, asset.id, reverseChange)
}

export async function applyExpense(tx: Tx, record: RecordRow) {
  const asset = await getOptionalAssetForBooks(tx, record, 'assetId', 'booksId')
  if (!asset) return

  const change = computeBalanceChange(asset, 'expense', record.amount, record.charge)
  await applyBalanceChange(tx, asset.id, change)
}
