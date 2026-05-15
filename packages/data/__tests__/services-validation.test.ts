import { createTransfer } from '../src/services/transfer-service'
import { createIncome } from '../src/services/income-service'
import { createExpense } from '../src/services/expense-service'
import {
  REIMBURSABLE,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  RECORD_TYPE_CATEGORY,
  IconValue,
} from '../src/constants';
import type { CreateRecordInput, Tx, TypeRow } from '../src/services/types'

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

function baseInput(overrides?: Partial<CreateRecordInput>): CreateRecordInput {
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

describe('transfer-service validation', () => {
  const transferType = {
    id: 1,
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
  } as TypeRow

  test('throws when assetId equals intoAssetId', async () => {
    const tx = mockTx({})
    const input = baseInput({ assetId: 10, intoAssetId: 10 })

    await expect(createTransfer(tx, input, transferType)).rejects.toThrow(
      'Transfer source and destination assets must be different'
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
    const input = baseInput({ relatedRecordIds: [5] })

    await expect(createIncome(tx, input, reimbursementType)).rejects.toThrow(
      'Expense 5 is not reimbursable'
    )
  })

  test('refund throws when expense is reimbursable', async () => {
    const tx = mockTxWithExpense(REIMBURSABLE.reimbursable)
    const input = baseInput({ relatedRecordIds: [5] })

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
    const input = baseInput({ booksId: 1 })

    await expect(createExpense(tx, input)).rejects.toThrow(
      'Asset 10 does not belong to books 1'
    )
  })

  test('transfer throws when fromAsset belongs to different books', async () => {
    const tx = mockTxWithAsset(999)
    const input = baseInput({ assetId: 10, intoAssetId: 20, booksId: 1 })
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
    const input = baseInput()
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.transfer, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment } as TypeRow

    await expect(createTransfer(tx, input, typeRow)).rejects.toThrow(
      'Credit card payment requires destination to be a credit card asset'
    )
  })

  test('debt borrow throws when source is not borrow debt', async () => {
    const tx = mockTxWithAssets('capital_account', '', 'capital_account', '')
    const input = baseInput()
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
    const input = baseInput({ amount: 100, charge: 200 })
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.income, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none } as TypeRow

    await expect(createIncome(tx, input, typeRow)).rejects.toThrow(
      'Income final amount (amount - charge) must be >= 0'
    )
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
    const input = baseInput({ booksId: 1, relatedRecordIds: [5] })
    const typeRow = { id: 1, typeCategory: RECORD_TYPE_CATEGORY.income, specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption } as TypeRow

    await expect(createIncome(tx, input, typeRow)).rejects.toThrow(
      'Expense 5 does not belong to the same books'
    )
  })
})
