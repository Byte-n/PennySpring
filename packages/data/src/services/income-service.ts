import { eq } from 'drizzle-orm'

import { REIMBURSABLE, RECORD_TYPE_SPECIAL_BEHAVIOR } from '../constants'
import { records, recordWithRecord } from '../schema'
import {
  applyBalanceChange,
  compactForeignKeys,
  computeBalanceChange,
  getOptionalAssetForBooks,
  recalculateAbsorption,
  syncImages,
  syncRecordRelations,
  syncTags,
} from './helpers'
import type { CreateCashflowRecordInput, RecordRow, Tx, TypeRow } from './types'

function isAbsorptionBehavior(specialBehavior: string): boolean {
  return (
    specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption ||
    specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption
  )
}

async function validateAbsorptionTargets(tx: Tx, typeRow: TypeRow, relatedRecordIds: number[], booksId: number) {
  for (const expenseId of relatedRecordIds) {
    const expense = await tx.select().from(records).where(eq(records.id, expenseId)).get()
    if (!expense) throw new Error(`Related expense not found: ${expenseId}`)
    if (expense.booksId !== booksId) throw new Error(`Expense ${expenseId} does not belong to the same books`)
    if (typeRow.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption) {
      if (expense.reimbursable !== REIMBURSABLE.reimbursable) {
        throw new Error(`Expense ${expenseId} is not reimbursable`)
      }
    } else if (typeRow.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption) {
      if (expense.reimbursable !== REIMBURSABLE.notReimbursable) {
        throw new Error(`Expense ${expenseId} is not refundable`)
      }
    }
  }
}

export async function createIncome(tx: Tx, input: CreateCashflowRecordInput, typeRow: TypeRow): Promise<RecordRow> {
  const asset = await getOptionalAssetForBooks(tx, input, 'assetId', 'booksId')
  const charge = input.charge ?? 0
  const isAbsorption = isAbsorptionBehavior(typeRow.specialBehavior)
  const relatedRecordIds = compactForeignKeys(input.relatedRecordIds)
  const finalAmount = input.amount - charge
  if (finalAmount < 0) throw new Error('Income final amount (amount - charge) must be >= 0')

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
    const balanceChange = computeBalanceChange(asset, 'income', input.amount, charge)
    await applyBalanceChange(tx, asset.id, balanceChange)
  }

  if (isAbsorption && relatedRecordIds.length) {
    await validateAbsorptionTargets(tx, typeRow, relatedRecordIds, input.booksId)
    await syncRecordRelations(tx, inserted.id, relatedRecordIds)
    for (const expenseId of relatedRecordIds) {
      await recalculateAbsorption(tx, expenseId)
    }
  }

  if (input.tagIds?.length) await syncTags(tx, inserted.id, input.tagIds)
  if (input.imagePaths?.length) await syncImages(tx, inserted.id, input.imagePaths)

  const result = await tx.select().from(records).where(eq(records.id, inserted.id)).get()
  return result!
}

export async function rollbackIncome(tx: Tx, record: RecordRow, typeRow: TypeRow) {
  const asset = await getOptionalAssetForBooks(tx, record, 'assetId', 'booksId')
  if (asset) {
    const reverseChange = -computeBalanceChange(asset, 'income', record.amount, record.charge)
    await applyBalanceChange(tx, asset.id, reverseChange)
  }

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
  const asset = await getOptionalAssetForBooks(tx, record, 'assetId', 'booksId')
  if (asset) {
    const change = computeBalanceChange(asset, 'income', record.amount, record.charge)
    await applyBalanceChange(tx, asset.id, change)
  }
  const normalizedRelatedRecordIds = compactForeignKeys(relatedRecordIds)

  if (isAbsorptionBehavior(typeRow.specialBehavior) && normalizedRelatedRecordIds.length) {
    await validateAbsorptionTargets(tx, typeRow, normalizedRelatedRecordIds, record.booksId)
    await syncRecordRelations(tx, record.id, normalizedRelatedRecordIds)
    for (const expenseId of normalizedRelatedRecordIds) {
      await recalculateAbsorption(tx, expenseId)
    }
  }
}
