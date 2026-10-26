import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  IconValue,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  VISIBILITY,
  type AssetRow,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';

jest.mock('../src/stores/bookStore', () => ({
  getGlobalApi: jest.fn(),
  useGlobalApi: jest.fn(),
}));

import {
  buildCreateRecordInput,
  filterTransferAssets,
  formatCentsAsExpression,
  getRelatedExpenseCandidates,
  normalizeMoneyTextToCents,
  validateAddRecordDraft,
} from '../src/screens/addRecord/addRecordDraft';

const NOW = new Date('2026-05-24T12:00:00+08:00').getTime();

function typeRow(overrides: Partial<TypeRow>): TypeRow {
  return {
    id: 1,
    booksId: 1,
    parentId: 0,
    name: '类型',
    icon: '' as IconValue,
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    isSystem: SYSTEM_STATUS.system,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    sort: 0,
    createdTime: NOW,
    updatedTime: NOW,
    ...overrides,
  };
}

function assetRow(overrides: Partial<AssetRow>): AssetRow {
  return {
    id: 1,
    booksId: 1,
    name: '资产',
    balance: 1000,
    totalAmount: 0,
    billingDate: 0,
    repaymentDate: 0,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.cash,
    invisible: VISIBILITY.visible,
    openBank: '',
    cardNo: '',
    remark: '',
    sort: 0,
    createdTime: NOW,
    updatedTime: NOW,
    ...overrides,
  } as AssetRow;
}

function recordRow(overrides: Partial<RecordRow>): RecordRow {
  return {
    id: 1,
    typeId: 1,
    assetId: 1,
    intoAssetId: 0,
    booksId: 1,
    amount: 1000,
    finalAmount: 1000,
    charge: 0,
    remark: '',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: NOW,
    createdTime: NOW,
    updatedTime: NOW,
    ...overrides,
  };
}

describe('addRecordDraft', () => {
  test('normalizes yuan text to cents', () => {
    expect(normalizeMoneyTextToCents('12.34')).toBe(1234);
    expect(normalizeMoneyTextToCents('')).toBe(0);
    expect(normalizeMoneyTextToCents('abc')).toBe(0);
  });

  test('formats cents as calculator expression without trailing zeros', () => {
    expect(formatCentsAsExpression(1234)).toBe('12.34');
    expect(formatCentsAsExpression(1230)).toBe('12.3');
    expect(formatCentsAsExpression(1200)).toBe('12');
    expect(formatCentsAsExpression(0)).toBe('');
    expect(formatCentsAsExpression(-1)).toBe('');
  });

  test('builds expense create input with reimbursable and attachments', () => {
    const expenseType = typeRow({ typeCategory: RECORD_TYPE_CATEGORY.expense });

    expect(
      buildCreateRecordInput('expense', {
        booksId: 1,
        amount: 1200,
        charge: 100,
        typeId: expenseType.id,
        selectedType: expenseType,
        assetId: 10,
        reimbursable: true,
        recordTime: NOW,
        remark: '午餐',
        tagIds: [1, 2],
        imagePaths: ['file://a.jpg'],
        relatedRecordIds: [],
      }),
    ).toEqual({
      booksId: 1,
      amount: 1200,
      charge: 100,
      typeId: expenseType.id,
      assetId: 10,
      reimbursable: REIMBURSABLE.reimbursable,
      recordTime: NOW,
      remark: '午餐',
      tagIds: [1, 2],
      imagePaths: ['file://a.jpg'],
    });
  });

  test('validates income absorption requires related expense', () => {
    const refundType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
    });

    expect(
      validateAddRecordDraft('income', {
        booksId: 1,
        amount: 1000,
        charge: 0,
        typeId: refundType.id,
        selectedType: refundType,
        assetId: 10,
        recordTime: NOW,
        remark: '',
        tagIds: [],
        imagePaths: [],
        relatedRecordIds: [],
      }),
    ).toBe('请选择关联支出');
  });

  test('validates transfer assets must be different', () => {
    const transferType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
    });

    expect(
      validateAddRecordDraft('transfer', {
        booksId: 1,
        amount: 1000,
        charge: 0,
        typeId: transferType.id,
        selectedType: transferType,
        assetId: 10,
        intoAssetId: 10,
        recordTime: NOW,
        remark: '',
        tagIds: [],
        imagePaths: [],
        relatedRecordIds: [],
      }),
    ).toBe('转出资产和转入资产不能相同');
  });

  test('filters transfer assets by special behavior', () => {
    const debtBorrowType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow,
    });
    const capitalAsset = assetRow({ id: 1, type: ASSET_TYPE.capitalAccount });
    const borrowDebtAsset = assetRow({
      id: 2,
      type: ASSET_TYPE.debt,
      classification: ASSET_CLASSIFICATION.borrow,
    });
    const lendDebtAsset = assetRow({
      id: 3,
      type: ASSET_TYPE.debt,
      classification: ASSET_CLASSIFICATION.lend,
    });

    expect(
      filterTransferAssets(
        [capitalAsset, borrowDebtAsset, lendDebtAsset],
        debtBorrowType,
        'from',
      ).map(asset => asset.id),
    ).toEqual([2]);
    expect(
      filterTransferAssets(
        [capitalAsset, borrowDebtAsset, lendDebtAsset],
        debtBorrowType,
        'to',
      ).map(asset => asset.id),
    ).toEqual([1]);
  });

  test('filters related expense candidates by refund and reimbursement behavior', () => {
    const expenseTypes = [typeRow({ id: 1, typeCategory: RECORD_TYPE_CATEGORY.expense })];
    const refundable = recordRow({ id: 1, typeId: 1, reimbursable: REIMBURSABLE.notReimbursable });
    const reimbursable = recordRow({ id: 2, typeId: 1, reimbursable: REIMBURSABLE.reimbursable });
    const refundType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
    });
    const reimbursementType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
    });

    expect(
      getRelatedExpenseCandidates([refundable, reimbursable], expenseTypes, refundType)
        .map(record => record.id),
    ).toEqual([1]);
    expect(
      getRelatedExpenseCandidates([refundable, reimbursable], expenseTypes, reimbursementType)
        .map(record => record.id),
    ).toEqual([2]);
  });
});
