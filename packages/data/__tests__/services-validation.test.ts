import { createTransfer } from '../src/services/transfer-service'
import { createIncome } from '../src/services/income-service'
import { createExpense } from '../src/services/expense-service'
import { createRecord, updateRecord } from '../src/services/record-service'
import { syncRecordRelations, syncTags } from '../src/services/helpers'
import {
  REIMBURSABLE,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  RECORD_TYPE_CATEGORY,
  IconValue,
} from '../src/constants';
import { recordWithRecord, tagWithRecord, tags } from '../src/schema'
import type { Database } from '../src/runtime'
import type {
  CreateCashflowRecordInput,
  CreateRecordInput,
  CreateTransferRecordInput,
  Tx,
  TypeRow,
  UpdateCashflowRecordInput,
} from '../src/services/types'

function mockTx(queryResults: Record<string, unknown>): Tx {
  const chainable = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 99 }]),
    get: jest.fn().mockImplementation(() => queryResults.default),
  }
  const tx = {
    select: jest.fn().mockReturnValue(chainable),
    insert: jest.fn().mockReturnValue(chainable),
    update: jest.fn().mockReturnValue(chainable),
    delete: jest.fn().mockReturnValue(chainable),
  } as unknown as Tx
  return tx
}

function mockTxWithGetResults(results: unknown[]): Tx {
  let callCount = 0
  const chainable = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 99 }]),
    get: jest.fn().mockImplementation(() => {
      const result = results[callCount]
      callCount++
      return result
    }),
  }
  return {
    select: jest.fn().mockReturnValue(chainable),
    insert: jest.fn().mockReturnValue(chainable),
    update: jest.fn().mockReturnValue(chainable),
    delete: jest.fn().mockReturnValue(chainable),
  } as unknown as Tx
}

function mockDb(tx: Tx): Database {
  return {
    transaction: jest.fn((callback) => callback(tx)),
  } as unknown as Database
}

function mockSyncTx(options: {
  existingTagIds?: number[]
  tagRows?: Array<{ id: number }>
  existingRelatedRecordIds?: number[]
}): { tx: Tx; insertValues: jest.Mock; select: jest.Mock } {
  const insertValues = jest.fn().mockResolvedValue(undefined)
  const select = jest.fn().mockImplementation(() => ({
    from: jest.fn().mockImplementation((table) => ({
      where: jest.fn().mockImplementation(() => {
        if (table === tagWithRecord) {
          return Promise.resolve((options.existingTagIds ?? []).map((tagId) => ({ tagId })))
        }
        if (table === tags) {
          return Promise.resolve(options.tagRows ?? [])
        }
        if (table === recordWithRecord) {
          return Promise.resolve(
            (options.existingRelatedRecordIds ?? []).map((relatedRecordId) => ({
              relatedRecordId,
            }))
          )
        }
        return Promise.resolve([])
      }),
    })),
  }))
  const tx = {
    select,
    insert: jest.fn().mockReturnValue({ values: insertValues }),
    update: jest.fn(),
    delete: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
  } as unknown as Tx
  return { tx, insertValues, select }
}

function baseCashflowInput(overrides?: Partial<CreateCashflowRecordInput>): CreateCashflowRecordInput {
  return {
    typeId: 1,
    assetId: 10,
    intoAssetId: 20,
    booksId: 1,
    amount: 1000,
    charge: 0,
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: Date.now(),
    ...overrides,
  }
}

function baseTransferInput(overrides?: Partial<CreateTransferRecordInput>): CreateTransferRecordInput {
  return {
    typeId: 1,
    assetId: 10,
    intoAssetId: 20,
    booksId: 1,
    amount: 1000,
    charge: 0,
    recordTime: Date.now(),
    ...overrides,
  }
}

function baseRecordInput(overrides?: Partial<CreateRecordInput>): CreateRecordInput {
  return {
    ...baseCashflowInput(),
    ...overrides,
  }
}

function baseUpdateInput(overrides?: Partial<UpdateCashflowRecordInput>): UpdateCashflowRecordInput {
  return {
    id: 1,
    ...baseCashflowInput(),
    ...overrides,
  }
}

describe('transfer-service validation', () => {
  const transferType = {
    id: 1,
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
  } as TypeRow

  test('throws when assetId equals intoAssetId', async () => {
    const tx = mockTx({})
    const input = baseTransferInput({ assetId: 10, intoAssetId: 10 })

    await expect(createTransfer(tx, input, transferType)).rejects.toThrow(
      'Transfer source and destination assets must be different'
    )
  })

  test('throws when destination asset is empty', async () => {
    const tx = mockTx({})
    const input = baseTransferInput({ intoAssetId: 0 })

    await expect(createTransfer(tx, input, transferType)).rejects.toThrow(
      'intoAssetId is required'
    )
  })
})

describe('income-service reimbursable validation', () => {
  function mockTxWithExpense(reimbursable: string): Tx {
    const expenseRecord = { id: 5, amount: 1000, charge: 0, reimbursable, booksId: 1 }
    const assetRow = { id: 10, type: 'capital_account', classification: '', balance: 5000, booksId: 1 }
    let callCount = 0

    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 99 }]),
      get: jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) return assetRow
        return expenseRecord
      }),
    }
    return {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update: jest.fn().mockReturnValue(chainable),
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
  }

  const reimbursementType: TypeRow = {
    id: 2,
    parentId: 0,
    name: '报销',
    icon: '' as IconValue,
    typeCategory: RECORD_TYPE_CATEGORY.income,
    isSystem: 'system',
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
    sort: 0,
    createdTime: Date.now(),
    updatedTime: Date.now(),
  } as TypeRow;

  const refundType: TypeRow = {
    id: 3,
    parentId: 0,
    name: '退款',
    icon: '' as IconValue,
    typeCategory: RECORD_TYPE_CATEGORY.income,
    isSystem: 'system',
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
    sort: 0,
    createdTime: Date.now(),
    updatedTime: Date.now(),
  } as TypeRow

  test('reimbursement throws when expense is not reimbursable', async () => {
    const tx = mockTxWithExpense(REIMBURSABLE.notReimbursable)
    const input = baseCashflowInput({ relatedRecordIds: [5] })

    await expect(createIncome(tx, input, reimbursementType)).rejects.toThrow(
      'Expense 5 is not reimbursable'
    )
  })

  test('refund throws when expense is reimbursable', async () => {
    const tx = mockTxWithExpense(REIMBURSABLE.reimbursable)
    const input = baseCashflowInput({ relatedRecordIds: [5] })

    await expect(createIncome(tx, input, refundType)).rejects.toThrow(
      'Expense 5 is not refundable'
    )
  })
})

describe('asset books ownership validation', () => {
  function mockTxWithAsset(booksId: number): Tx {
    const assetRow = { id: 10, type: 'capital_account', classification: '', balance: 5000, booksId }
    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 99 }]),
      get: jest.fn().mockReturnValue(assetRow),
    }
    return {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update: jest.fn().mockReturnValue(chainable),
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
  }

  test('expense throws when asset belongs to different books', async () => {
    const tx = mockTxWithAsset(999)
    const input = baseCashflowInput({ booksId: 1 })

    await expect(createExpense(tx, input)).rejects.toThrow(
      'Asset 10 does not belong to books 1'
    )
  })

  test('expense allows empty asset without updating asset balance', async () => {
    const insertValues = jest.fn().mockReturnThis()
    const returning = jest.fn().mockResolvedValue([{ id: 99 }])
    const update = jest.fn()
    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: insertValues,
      returning,
      get: jest.fn(),
    }
    const tx = {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update,
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
    const input = baseCashflowInput({ assetId: 0 })

    await expect(createExpense(tx, input)).resolves.toEqual({ id: 99 })
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ assetId: 0 })
    )
    expect(update).not.toHaveBeenCalled()
  })

  test('transfer throws when fromAsset belongs to different books', async () => {
    const tx = mockTxWithAsset(999)
    const input = baseTransferInput({ assetId: 10, intoAssetId: 20, booksId: 1 })
    const transferType = {
      id: 1,
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    } as TypeRow

    await expect(createTransfer(tx, input, transferType)).rejects.toThrow(
      'Asset 10 does not belong to books 1'
    )
  })
})

describe('special transfer behavior validation', () => {
  function mockTxWithAssets(fromType: string, fromClassification: string, toType: string, toClassification: string): Tx {
    const fromAsset = { id: 10, type: fromType, classification: fromClassification, balance: 5000, booksId: 1 }
    const toAsset = { id: 20, type: toType, classification: toClassification, balance: 3000, booksId: 1 }
    let callCount = 0
    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 99 }]),
      get: jest.fn().mockImplementation(() => {
        callCount++
        return callCount === 1 ? fromAsset : toAsset
      }),
    }
    return {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update: jest.fn().mockReturnValue(chainable),
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
  }

  test('credit card payment throws when destination is not credit card', async () => {
    const tx = mockTxWithAssets('capital_account', '', 'capital_account', '')
    const input = baseTransferInput()
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.transfer, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment } as TypeRow

    await expect(createTransfer(tx, input, typeRow)).rejects.toThrow(
      'Credit card payment requires destination to be a credit card asset'
    )
  })

  test('debt borrow throws when source is not borrow debt', async () => {
    const tx = mockTxWithAssets('capital_account', '', 'capital_account', '')
    const input = baseTransferInput()
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.transfer, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow } as TypeRow

    await expect(createTransfer(tx, input, typeRow)).rejects.toThrow(
      'Debt borrow requires source to be a borrow debt asset'
    )
  })
})

describe('income final_amount non-negative validation', () => {
  function mockTxWithAssetForIncome(): Tx {
    const assetRow = { id: 10, type: 'capital_account', classification: '', balance: 5000, booksId: 1 }
    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 99 }]),
      get: jest.fn().mockReturnValue(assetRow),
    }
    return {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update: jest.fn().mockReturnValue(chainable),
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
  }

  test('throws when charge exceeds amount', async () => {
    const tx = mockTxWithAssetForIncome()
    const input = baseCashflowInput({ amount: 100, charge: 200 })
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.income, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none } as TypeRow

    await expect(createIncome(tx, input, typeRow)).rejects.toThrow(
      'Income final amount (amount - charge) must be >= 0'
    )
  })

  test('allows empty asset without updating asset balance', async () => {
    const insertedRecord = {
      id: 99,
      typeId: 1,
      assetId: 0,
      intoAssetId: 0,
      booksId: 1,
      amount: 1000,
      finalAmount: 1000,
      charge: 0,
      remark: '',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: Date.now(),
      createdTime: Date.now(),
      updatedTime: Date.now(),
    }
    const insertValues = jest.fn().mockReturnThis()
    const returning = jest.fn().mockResolvedValue([{ id: 99 }])
    const update = jest.fn()
    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: insertValues,
      returning,
      get: jest.fn().mockReturnValue(insertedRecord),
    }
    const tx = {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update,
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
    const input = baseCashflowInput({ assetId: 0 })
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.income, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none } as TypeRow

    await expect(createIncome(tx, input, typeRow)).resolves.toEqual(insertedRecord)
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({ assetId: 0 })
    )
    expect(update).not.toHaveBeenCalled()
  })
})

describe('absorption target books validation', () => {
  function mockTxWithExpenseFromDifferentBooks(): Tx {
    const assetRow = { id: 10, type: 'capital_account', classification: '', balance: 5000, booksId: 1 }
    const expenseRecord = { id: 5, amount: 1000, charge: 0, reimbursable: 'not_reimbursable', booksId: 999 }
    let callCount = 0
    const chainable = {
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 99 }]),
      get: jest.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) return assetRow
        return expenseRecord
      }),
    }
    return {
      select: jest.fn().mockReturnValue(chainable),
      insert: jest.fn().mockReturnValue(chainable),
      update: jest.fn().mockReturnValue(chainable),
      delete: jest.fn().mockReturnValue(chainable),
    } as unknown as Tx
  }

  test('throws when related expense belongs to different books', async () => {
    const tx = mockTxWithExpenseFromDifferentBooks()
    const input = baseCashflowInput({ booksId: 1, relatedRecordIds: [5] })
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.income, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption } as TypeRow

    await expect(createIncome(tx, input, typeRow)).rejects.toThrow(
      'Expense 5 does not belong to the same books'
    )
  })
})

describe('record-service foreign key validation', () => {
  const expenseType = {
    id: 1,
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
  } as TypeRow

  test('throws when type is empty', async () => {
    const db = mockDb(mockTx({}))
    const input = baseRecordInput({ typeId: 0 })

    expect(() => createRecord(db, input)).toThrow('typeId is required')
  })

  test('throws when books is empty', async () => {
    const db = mockDb(mockTx({}))
    const input = baseRecordInput({ booksId: 0 })

    expect(() => createRecord(db, input)).toThrow('booksId is required')
  })

  test('throws when books does not exist', async () => {
    const tx = mockTxWithGetResults([expenseType, undefined])
    const db = mockDb(tx)
    const input = baseRecordInput({ booksId: 1 })

    await expect(createRecord(db, input)).rejects.toThrow('Books not found: 1')
  })

  test('expense throws when reimbursable is missing', async () => {
    const tx = mockTxWithGetResults([expenseType, { id: 1 }])
    const db = mockDb(tx)
    const input = baseRecordInput({ reimbursable: undefined })

    await expect(createRecord(db, input)).rejects.toThrow('reimbursable is required')
  })

  test('update throws when the new asset belongs to a different books', async () => {
    const oldRecord = {
      id: 9,
      typeId: 1,
      assetId: 10,
      intoAssetId: 0,
      booksId: 1,
      amount: 1000,
      finalAmount: 1000,
      charge: 0,
      remark: '',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: Date.now(),
      createdTime: Date.now(),
      updatedTime: Date.now(),
    }
    const bookRow = { id: 1 }
    const newAsset = { id: 20, type: 'capital_account', classification: '', balance: 5000, booksId: 999 }
    const tx = mockTxWithGetResults([
      oldRecord,
      expenseType,
      expenseType,
      bookRow,
      newAsset,
    ])
    const db = mockDb(tx)
    const input = baseUpdateInput({ id: 9, assetId: 20, booksId: 1 })

    await expect(updateRecord(db, input)).rejects.toThrow(
      'Asset 20 does not belong to books 1'
    )
  })
})

describe('junction foreign key validation', () => {
  test('syncTags treats zero tag IDs as empty values', async () => {
    const { tx, insertValues, select } = mockSyncTx({ existingTagIds: [] })

    await syncTags(tx, 1, [0])

    expect(select).toHaveBeenCalledTimes(1)
    expect(insertValues).not.toHaveBeenCalled()
  })

  test('syncTags throws when a non-zero tag does not exist', async () => {
    const { tx, insertValues } = mockSyncTx({ existingTagIds: [], tagRows: [] })

    await expect(syncTags(tx, 1, [0, 9])).rejects.toThrow('Tag not found: 9')
    expect(insertValues).not.toHaveBeenCalled()
  })

  test('syncRecordRelations treats zero related record IDs as empty values', async () => {
    const { tx, insertValues } = mockSyncTx({ existingRelatedRecordIds: [] })

    await syncRecordRelations(tx, 1, [0, 5])

    expect(insertValues).toHaveBeenCalledTimes(1)
    expect(insertValues).toHaveBeenCalledWith({ recordId: 1, relatedRecordId: 5 })
  })
})

describe('absorption empty foreign key handling', () => {
  test('income absorption ignores zero related record IDs', async () => {
    const assetRow = { id: 10, type: 'capital_account', classification: '', balance: 5000, booksId: 1 }
    const insertedRecord = {
      id: 99,
      typeId: 2,
      assetId: 10,
      intoAssetId: 0,
      booksId: 1,
      amount: 1000,
      finalAmount: 1000,
      charge: 0,
      remark: '',
      reimbursable: REIMBURSABLE.notReimbursable,
      recordTime: Date.now(),
      createdTime: Date.now(),
      updatedTime: Date.now(),
    }
    const tx = mockTxWithGetResults([assetRow, insertedRecord])
    const input = baseCashflowInput({ relatedRecordIds: [0] })
    const reimbursementType = {
      id: 2,
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
    } as TypeRow

    await expect(createIncome(tx, input, reimbursementType)).resolves.toEqual(insertedRecord)
  })
})
