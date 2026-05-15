import { ASSET_CLASSIFICATION, ASSET_TYPE, REIMBURSABLE, RECORD_TYPE_SPECIAL_BEHAVIOR } from '../constants'
import { records } from '../schema'
import {
  applyBalanceChange,
  computeBalanceChange,
  getAssetForBooks,
  getRequiredForeignKey,
  syncImages,
  syncTags,
} from './helpers'
import type { AssetRow, CreateTransferRecordInput, RecordRow, Tx, TypeRow } from './types'

function validateSpecialBehavior(typeRow: TypeRow, fromAsset: AssetRow, toAsset: AssetRow) {
  switch (typeRow.specialBehavior) {
    case RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment:
      if (toAsset.type !== ASSET_TYPE.creditCard) {
        throw new Error('Credit card payment requires destination to be a credit card asset')
      }
      break
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow:
      if (fromAsset.type !== ASSET_TYPE.debt || fromAsset.classification !== ASSET_CLASSIFICATION.borrow) {
        throw new Error('Debt borrow requires source to be a borrow debt asset')
      }
      break
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtLend:
      if (toAsset.type !== ASSET_TYPE.debt || toAsset.classification !== ASSET_CLASSIFICATION.lend) {
        throw new Error('Debt lend requires destination to be a lend debt asset')
      }
      break
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtRepayment:
      if (toAsset.type !== ASSET_TYPE.debt || toAsset.classification !== ASSET_CLASSIFICATION.borrow) {
        throw new Error('Debt repayment requires destination to be a borrow debt asset')
      }
      break
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtProceeds:
      if (fromAsset.type !== ASSET_TYPE.debt || fromAsset.classification !== ASSET_CLASSIFICATION.lend) {
        throw new Error('Debt proceeds requires source to be a lend debt asset')
      }
      break
  }
}

export async function createTransfer(
  tx: Tx,
  input: CreateTransferRecordInput,
  typeRow: TypeRow
): Promise<RecordRow> {
  const intoAssetId = getRequiredForeignKey(input, 'intoAssetId')
  if (input.assetId === intoAssetId) {
    throw new Error('Transfer source and destination assets must be different')
  }
  const fromAsset = await getAssetForBooks(tx, input, 'assetId', 'booksId')
  const toAsset = await getAssetForBooks(tx, input, 'intoAssetId', 'booksId')
  validateSpecialBehavior(typeRow, fromAsset, toAsset)
  const charge = input.charge ?? 0
  const finalAmount = charge

  const [inserted] = await tx
    .insert(records)
    .values({
      typeId: input.typeId,
      assetId: input.assetId,
      intoAssetId,
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
  await applyBalanceChange(tx, intoAssetId, inChange)

  if (input.tagIds?.length) await syncTags(tx, inserted.id, input.tagIds)
  if (input.imagePaths?.length) await syncImages(tx, inserted.id, input.imagePaths)

  return inserted
}

export async function rollbackTransfer(tx: Tx, record: RecordRow) {
  const fromAsset = await getAssetForBooks(tx, record, 'assetId', 'booksId')
  const toAsset = await getAssetForBooks(tx, record, 'intoAssetId', 'booksId')

  const reverseOut = -computeBalanceChange(fromAsset, 'transfer_out', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, reverseOut)

  const reverseIn = -computeBalanceChange(toAsset, 'transfer_in', record.amount, record.charge)
  await applyBalanceChange(tx, record.intoAssetId, reverseIn)
}

export async function applyTransfer(tx: Tx, record: RecordRow) {
  const fromAsset = await getAssetForBooks(tx, record, 'assetId', 'booksId')
  const toAsset = await getAssetForBooks(tx, record, 'intoAssetId', 'booksId')

  const outChange = computeBalanceChange(fromAsset, 'transfer_out', record.amount, record.charge)
  await applyBalanceChange(tx, record.assetId, outChange)

  const inChange = computeBalanceChange(toAsset, 'transfer_in', record.amount, record.charge)
  await applyBalanceChange(tx, record.intoAssetId, inChange)
}
