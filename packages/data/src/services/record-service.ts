import { eq } from 'drizzle-orm'

import { RECORD_TYPE_CATEGORY } from '../constants'
import type { Database } from '../runtime'
import { records, recordWithRecord, types } from '../schema'
import { applyExpense, createExpense, rollbackExpense } from './expense-service'
import { deleteAllJunctions, recalculateAbsorption, syncImages, syncTags } from './helpers'
import { applyIncome, createIncome, rollbackIncome } from './income-service'
import { applyTransfer, createTransfer, rollbackTransfer } from './transfer-service'
import type { CreateRecordInput, RecordRow, Tx, TypeRow, UpdateRecordInput } from './types'

async function getTypeRow(tx: Tx, typeId: number): Promise<TypeRow> {
  const row = await tx.select().from(types).where(eq(types.id, typeId)).get()
  if (!row) throw new Error(`Type not found: ${typeId}`)
  return row
}

async function getRecordRow(tx: Tx, recordId: number): Promise<RecordRow> {
  const row = await tx.select().from(records).where(eq(records.id, recordId)).get()
  if (!row) throw new Error(`Record not found: ${recordId}`)
  return row
}

function validateInput(input: CreateRecordInput | UpdateRecordInput) {
  if (input.amount < 0) throw new Error('amount must be >= 0')
  if ((input.charge ?? 0) < 0) throw new Error('charge must be >= 0')
}

async function rollbackRecord(tx: Tx, record: RecordRow, typeRow: TypeRow) {
  switch (typeRow.typeCategory) {
    case RECORD_TYPE_CATEGORY.expense:
      await rollbackExpense(tx, record)
      break
    case RECORD_TYPE_CATEGORY.income:
      await rollbackIncome(tx, record, typeRow)
      break
    case RECORD_TYPE_CATEGORY.transfer:
      await rollbackTransfer(tx, record)
      break
  }
}

export function createRecord(db: Database, input: CreateRecordInput): Promise<RecordRow> {
  validateInput(input)

  return db.transaction(async (tx) => {
    const typeRow = await getTypeRow(tx, input.typeId)

    switch (typeRow.typeCategory) {
      case RECORD_TYPE_CATEGORY.expense:
        return createExpense(tx, input)
      case RECORD_TYPE_CATEGORY.income:
        return createIncome(tx, input, typeRow)
      case RECORD_TYPE_CATEGORY.transfer:
        return createTransfer(tx, input, typeRow)
      default:
        throw new Error(`Unknown type category: ${typeRow.typeCategory}`)
    }
  })
}

export function updateRecord(db: Database, input: UpdateRecordInput): Promise<RecordRow> {
  validateInput(input)

  return db.transaction(async (tx) => {
    const oldRecord = await getRecordRow(tx, input.id)
    const oldTypeRow = await getTypeRow(tx, oldRecord.typeId)
    const newTypeRow = await getTypeRow(tx, input.typeId)
    const charge = input.charge ?? 0

    await rollbackRecord(tx, oldRecord, oldTypeRow)

    let finalAmount: number
    switch (newTypeRow.typeCategory) {
      case RECORD_TYPE_CATEGORY.expense:
        finalAmount = input.amount + charge
        break
      case RECORD_TYPE_CATEGORY.income:
        finalAmount = input.amount - charge
        if (finalAmount < 0) throw new Error('Income final amount (amount - charge) must be >= 0')
        break
      case RECORD_TYPE_CATEGORY.transfer:
        finalAmount = charge
        break
      default:
        throw new Error(`Unknown type category: ${newTypeRow.typeCategory}`)
    }

    const intoAssetId = newTypeRow.typeCategory === RECORD_TYPE_CATEGORY.transfer
      ? input.intoAssetId!
      : 0

    await tx.update(records)
      .set({
        typeId: input.typeId,
        assetId: input.assetId,
        intoAssetId,
        booksId: input.booksId,
        amount: input.amount,
        finalAmount,
        charge,
        remark: input.remark ?? '',
        reimbursable: input.reimbursable ?? oldRecord.reimbursable,
        recordTime: input.recordTime,
      })
      .where(eq(records.id, input.id))

    const updatedRecord = await getRecordRow(tx, input.id)

    switch (newTypeRow.typeCategory) {
      case RECORD_TYPE_CATEGORY.expense:
        await applyExpense(tx, updatedRecord)
        await handleExpenseAbsorptionOnModify(tx, input.id)
        break
      case RECORD_TYPE_CATEGORY.income:
        await applyIncome(tx, updatedRecord, newTypeRow, input.relatedRecordIds)
        break
      case RECORD_TYPE_CATEGORY.transfer:
        await applyTransfer(tx, updatedRecord)
        break
    }

    await syncTags(tx, input.id, input.tagIds ?? [])
    await syncImages(tx, input.id, input.imagePaths ?? [])

    return getRecordRow(tx, input.id)
  })
}

async function handleExpenseAbsorptionOnModify(tx: Tx, recordId: number) {
  const links = await tx
    .select({ recordId: recordWithRecord.recordId })
    .from(recordWithRecord)
    .where(eq(recordWithRecord.relatedRecordId, recordId))

  if (links.length > 0) {
    await recalculateAbsorption(tx, recordId)
  }
}

export function deleteRecord(db: Database, recordId: number): Promise<void> {
  return db.transaction(async (tx) => {
    const record = await getRecordRow(tx, recordId)
    const typeRow = await getTypeRow(tx, record.typeId)

    const absorbedByLinks = await tx
      .select({ recordId: recordWithRecord.recordId })
      .from(recordWithRecord)
      .where(eq(recordWithRecord.relatedRecordId, recordId))

    if (absorbedByLinks.length > 0) {
      await tx.delete(recordWithRecord).where(eq(recordWithRecord.relatedRecordId, recordId))

      const affectedExpenseIds = new Set<number>()
      for (const link of absorbedByLinks) {
        const remainingLinks = await tx
          .select({ relatedRecordId: recordWithRecord.relatedRecordId })
          .from(recordWithRecord)
          .where(eq(recordWithRecord.recordId, link.recordId))

        if (remainingLinks.length === 0) {
          const incomeRecord = await tx.select().from(records).where(eq(records.id, link.recordId)).get()
          if (incomeRecord) {
            await tx.update(records)
              .set({ finalAmount: incomeRecord.amount - incomeRecord.charge })
              .where(eq(records.id, link.recordId))
          }
        } else {
          for (const r of remainingLinks) {
            affectedExpenseIds.add(r.relatedRecordId)
          }
        }
      }

      for (const expenseId of affectedExpenseIds) {
        await recalculateAbsorption(tx, expenseId)
      }
    }

    await rollbackRecord(tx, record, typeRow)
    await deleteAllJunctions(tx, recordId)
    await tx.delete(records).where(eq(records.id, recordId))
  })
}
