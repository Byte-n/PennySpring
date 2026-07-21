import { desc, eq } from 'drizzle-orm'

import { RECORD_TYPE_CATEGORY, REIMBURSABLE } from '../constants'
import type { Database } from '../types'
import { imageWithRelated, records, recordWithRecord, tagWithRecord, types } from '../schema'
import { applyExpense, createExpense, rollbackExpense } from './expense-service'
import {
  deleteAllJunctions,
  getAssetForBooks,
  getRequiredForeignKey,
  recalculateAbsorption,
  syncImages,
  syncTags,
  validateBookExists,
} from './helpers'
import { applyIncome, createIncome, rollbackIncome } from './income-service'
import { applyTransfer, createTransfer, rollbackTransfer } from './transfer-service'
import type {
  CreateCashflowRecordInput,
  CreateRecordInput,
  CreateTransferRecordInput,
  RecordDetail,
  RecordRow,
  Tx,
  TypeRow,
  UpdateCashflowRecordInput,
  UpdateRecordInput,
  UpdateTransferRecordInput,
} from './types'

async function getTypeRow(tx: Tx, typeId: number, booksId: number): Promise<TypeRow> {
  const requiredTypeId = getRequiredForeignKey({ typeId }, 'typeId')
  const row = await tx.select().from(types).where(eq(types.id, requiredTypeId)).get()
  if (!row) throw new Error(`Type not found: ${requiredTypeId}`)
  if (row.booksId !== booksId) {
    throw new Error(`Type ${requiredTypeId} does not belong to book ${booksId}`)
  }
  return row
}

async function getRecordRow(tx: Tx, recordId: number, booksId?: number): Promise<RecordRow> {
  const row = await tx.select().from(records).where(eq(records.id, recordId)).get()
  if (!row) throw new Error(`Record not found: ${recordId}`)
  if (booksId !== undefined && row.booksId !== booksId) {
    throw new Error(`Record ${recordId} does not belong to book ${booksId}`)
  }
  return row
}

function validateInput(input: CreateRecordInput | UpdateRecordInput) {
  getRequiredForeignKey(input, 'typeId')
  getRequiredForeignKey(input, 'booksId')
  if (input.amount < 0) throw new Error('amount must be >= 0')
  if ((input.charge ?? 0) < 0) throw new Error('charge must be >= 0')
}

function assertCreateCashflowInput(input: CreateRecordInput): asserts input is CreateCashflowRecordInput {
  if (input.reimbursable === undefined) throw new Error('reimbursable is required')
}

function assertUpdateCashflowInput(input: UpdateRecordInput): asserts input is UpdateCashflowRecordInput {
  if (input.reimbursable === undefined) throw new Error('reimbursable is required')
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

async function validateUpdateRecordReferences(
  tx: Tx,
  input: UpdateRecordInput,
  typeRow: TypeRow
): Promise<number> {
  if (typeRow.typeCategory !== RECORD_TYPE_CATEGORY.transfer) {
    await getAssetForBooks(tx, input as UpdateCashflowRecordInput, 'assetId', 'booksId')
    return 0
  }

  const transferInput = input as UpdateTransferRecordInput
  const intoAssetId = getRequiredForeignKey(transferInput, 'intoAssetId')
  if (transferInput.assetId === intoAssetId) {
    throw new Error('Transfer source and destination assets must be different')
  }

  await getAssetForBooks(tx, transferInput, 'assetId', 'booksId')
  await getAssetForBooks(tx, transferInput, 'intoAssetId', 'booksId')

  return intoAssetId
}

export function getRecordsByBook(db: Database, booksId: number): Promise<RecordRow[]> {
  const requiredBooksId = getRequiredForeignKey({ booksId }, 'booksId')

  return db
    .select()
    .from(records)
    .where(eq(records.booksId, requiredBooksId))
    .orderBy(desc(records.recordTime))
    .all()
}

export async function getRecordDetailById(db: Database, recordId: number, booksId: number): Promise<RecordDetail> {
  const record = await db.select().from(records).where(eq(records.id, recordId)).get()
  if (!record) throw new Error(`记录不存在: ${recordId}`)
  if (record.booksId !== booksId) {
    throw new Error(`记录 ${recordId} 不属于账本 ${booksId}`)
  }

  const tagRows = await db
    .select({ tagId: tagWithRecord.tagId })
    .from(tagWithRecord)
    .where(eq(tagWithRecord.recordId, recordId))
  const imageRows = await db
    .select({ imagePath: imageWithRelated.imagePath })
    .from(imageWithRelated)
    .where(eq(imageWithRelated.recordId, recordId))
  const relatedRows = await db
    .select({ relatedRecordId: recordWithRecord.relatedRecordId })
    .from(recordWithRecord)
    .where(eq(recordWithRecord.recordId, recordId))

  return {
    record,
    tagIds: tagRows.map((row) => row.tagId),
    imagePaths: imageRows.map((row) => row.imagePath),
    relatedRecordIds: relatedRows.map((row) => row.relatedRecordId),
  }
}

export function createRecord(db: Database, input: CreateRecordInput): Promise<RecordRow> {
  validateInput(input)

  return db.transaction(async (tx) => {
    const typeRow = await getTypeRow(tx, input.typeId, input.booksId)
    await validateBookExists(tx, input, 'booksId')

    switch (typeRow.typeCategory) {
      case RECORD_TYPE_CATEGORY.expense:
        assertCreateCashflowInput(input)
        return createExpense(tx, input)
      case RECORD_TYPE_CATEGORY.income:
        assertCreateCashflowInput(input)
        return createIncome(tx, input, typeRow)
      case RECORD_TYPE_CATEGORY.transfer:
        return createTransfer(tx, input as CreateTransferRecordInput, typeRow)
      default:
        throw new Error(`Unknown type category: ${typeRow.typeCategory}`)
    }
  })
}

export function updateRecord(db: Database, input: UpdateRecordInput): Promise<RecordRow> {
  validateInput(input)

  return db.transaction(async (tx) => {
    const oldRecord = await getRecordRow(tx, input.id, input.booksId)
    const oldTypeRow = await getTypeRow(tx, oldRecord.typeId, input.booksId)
    const newTypeRow = await getTypeRow(tx, input.typeId, input.booksId)
    await validateBookExists(tx, input, 'booksId')
    const intoAssetId = await validateUpdateRecordReferences(tx, input, newTypeRow)
    const charge = input.charge ?? 0

    await rollbackRecord(tx, oldRecord, oldTypeRow)

    let finalAmount: number
    switch (newTypeRow.typeCategory) {
      case RECORD_TYPE_CATEGORY.expense:
        assertUpdateCashflowInput(input)
        finalAmount = input.amount + charge
        break
      case RECORD_TYPE_CATEGORY.income:
        assertUpdateCashflowInput(input)
        finalAmount = input.amount - charge
        if (finalAmount < 0) throw new Error('Income final amount (amount - charge) must be >= 0')
        break
      case RECORD_TYPE_CATEGORY.transfer:
        finalAmount = charge
        break
      default:
        throw new Error(`Unknown type category: ${newTypeRow.typeCategory}`)
    }

    await tx.update(records)
      .set({
        typeId: input.typeId,
        assetId: newTypeRow.typeCategory === RECORD_TYPE_CATEGORY.transfer
          ? (input as UpdateTransferRecordInput).assetId
          : (input as UpdateCashflowRecordInput).assetId ?? 0,
        intoAssetId,
        booksId: input.booksId,
        amount: input.amount,
        finalAmount,
        charge,
        remark: input.remark ?? '',
        reimbursable: newTypeRow.typeCategory === RECORD_TYPE_CATEGORY.transfer
          ? REIMBURSABLE.notReimbursable
          : newTypeRow.typeCategory === RECORD_TYPE_CATEGORY.income
            ? REIMBURSABLE.notReimbursable
            : (input as UpdateCashflowRecordInput).reimbursable,
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

export function deleteRecord(db: Database, recordId: number, booksId: number): Promise<void> {
  return db.transaction(async (tx) => {
    const record = await getRecordRow(tx, recordId, booksId)
    const typeRow = await getTypeRow(tx, record.typeId, booksId)

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
