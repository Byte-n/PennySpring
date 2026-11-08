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
  type DraftItem,
  type RecordRow,
  type TypeRow,
} from '@pennyspring/api';

jest.mock('../src/stores/bookStore', () => ({
  getGlobalApi: jest.fn(),
  useGlobalApi: jest.fn(),
}));

jest.mock('../src/features/quickBookDraft/confirmDraft', () => ({
  confirmQuickBookDraftItem: jest.fn(),
}));

jest.mock('../src/features/quickBookDraft/draftCacheStorage', () => ({
  quickBookDraftCache: { getById: jest.fn() },
}));

jest.mock('../src/features/quickBookDraft/bookApi', () => ({
  resolveBookApi: jest.fn(),
  resolveBookMedia: jest.fn(),
}));

import {
  resolveBookApi,
  resolveBookMedia,
} from '../src/features/quickBookDraft/bookApi';
import { confirmQuickBookDraftItem } from '../src/features/quickBookDraft/confirmDraft';
import { quickBookDraftCache } from '../src/features/quickBookDraft/draftCacheStorage';

const mockConfirmDraftItem = confirmQuickBookDraftItem as jest.Mock;
const mockResolveBookApi = resolveBookApi as jest.Mock;
const mockResolveBookMedia = resolveBookMedia as jest.Mock;
const mockGetDraft = (quickBookDraftCache as unknown as { getById: jest.Mock })
  .getById;

import {
  buildCreateRecordInput,
  filterTransferAssets,
  formatCentsAsExpression,
  getRelatedExpenseCandidates,
  normalizeMoneyTextToCents,
  saveAddRecordDraft,
  validateAddRecordDraft,
} from '../src/screens/addRecord/addRecordDraft';
import { getGlobalApi } from '../src/stores/bookStore';
import { useDraftVersionStore } from '../src/stores/draftVersionStore';
import { useSyncVersionStore } from '../src/stores/syncVersionStore';

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

beforeEach(() => {
  mockConfirmDraftItem.mockReset();
  mockGetDraft.mockReset();
  mockResolveBookApi.mockReset();
  mockResolveBookMedia.mockReset();
});

function draftItem(overrides: Partial<DraftItem> = {}): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: 0,
    typeName: '',
    amountCents: null,
    recordTime: NOW,
    remark: '',
    assetId: 0,
    assetName: '',
    intoAssetId: 0,
    intoAssetName: '',
    chargeCents: 0,
    tagIds: [],
    reimbursable: false,
    warnings: [],
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
    const expenseTypes = [
      typeRow({ id: 1, typeCategory: RECORD_TYPE_CATEGORY.expense }),
    ];
    const refundable = recordRow({
      id: 1,
      typeId: 1,
      reimbursable: REIMBURSABLE.notReimbursable,
    });
    const reimbursable = recordRow({
      id: 2,
      typeId: 1,
      reimbursable: REIMBURSABLE.reimbursable,
    });
    const refundType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
    });
    const reimbursementType = typeRow({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
    });

    expect(
      getRelatedExpenseCandidates(
        [refundable, reimbursable],
        expenseTypes,
        refundType,
      ).map(record => record.id),
    ).toEqual([1]);
    expect(
      getRelatedExpenseCandidates(
        [refundable, reimbursable],
        expenseTypes,
        reimbursementType,
      ).map(record => record.id),
    ).toEqual([2]);
  });
});

describe('saveAddRecordDraft', () => {
  it('bumps the record version after a successful write', async () => {
    const create = jest.fn(async () => 1);
    jest.mocked(getGlobalApi).mockReturnValue({
      record: { create, update: jest.fn() },
    } as never);
    const before = useSyncVersionStore.getState().recordVersion;

    await saveAddRecordDraft(
      'expense',
      {
        booksId: 1,
        typeId: 1,
        selectedType: typeRow({}),
        amount: 1000,
        charge: 0,
        recordTime: NOW,
        remark: '',
        tagIds: [],
        imagePaths: [],
        relatedRecordIds: [],
      },
      undefined,
    );

    expect(create).toHaveBeenCalledTimes(1);
    expect(useSyncVersionStore.getState().recordVersion).toBe(before + 1);
  });

  it('does not bump the record version when the write fails', async () => {
    jest.mocked(getGlobalApi).mockReturnValue({
      record: {
        create: jest.fn(async () => {
          throw new Error('database locked');
        }),
        update: jest.fn(),
      },
    } as never);
    const before = useSyncVersionStore.getState().recordVersion;

    await expect(
      saveAddRecordDraft(
        'expense',
        {
          booksId: 1,
          typeId: 1,
          selectedType: typeRow({}),
          amount: 1000,
          charge: 0,
          recordTime: NOW,
          remark: '',
          tagIds: [],
          imagePaths: [],
          relatedRecordIds: [],
        },
        undefined,
      ),
    ).rejects.toThrow('database locked');

    expect(useSyncVersionStore.getState().recordVersion).toBe(before);
  });

  it('confirms the draft item with the target book instead of creating a record directly', async () => {
    // Arrange
    const create = jest.fn(async () => 1);
    jest.mocked(getGlobalApi).mockReturnValue({
      record: { create, update: jest.fn() },
    } as never);
    mockGetDraft.mockResolvedValue({
      id: 'draft-1',
      target: {
        kind: 'local',
        serverUrl: '',
        booksId: 2,
        bookName: '目标账本',
      },
      imagePath: '',
    });
    mockResolveBookApi.mockResolvedValue({});
    mockResolveBookMedia.mockResolvedValue({});
    mockConfirmDraftItem.mockResolvedValue({ item: draftItem(), recordId: 9 });
    const recordVersionBefore = useSyncVersionStore.getState().recordVersion;
    const draftVersionBefore = useDraftVersionStore.getState().draftVersion;

    // Act
    await saveAddRecordDraft(
      'expense',
      {
        booksId: 2,
        typeId: 1,
        selectedType: typeRow({}),
        amount: 1000,
        charge: 0,
        recordTime: NOW,
        remark: '',
        tagIds: [],
        imagePaths: ['file://a.jpg'],
        relatedRecordIds: [],
      },
      undefined,
      { draft: { draftId: 'draft-1', itemIndex: 1, booksId: 2 } },
    );

    // Assert
    expect(mockConfirmDraftItem).toHaveBeenCalledTimes(1);
    expect(mockConfirmDraftItem).toHaveBeenCalledWith(
      expect.objectContaining({
        draftId: 'draft-1',
        itemIndex: 1,
        input: expect.objectContaining({ booksId: 2, amount: 1000 }),
      }),
    );
    expect(create).not.toHaveBeenCalled();
    expect(useSyncVersionStore.getState().recordVersion).toBe(
      recordVersionBefore + 1,
    );
    expect(useDraftVersionStore.getState().draftVersion).toBe(
      draftVersionBefore + 1,
    );
  });

  it('does not bump any version when confirming the draft item fails', async () => {
    // Arrange
    mockGetDraft.mockResolvedValue({
      id: 'draft-1',
      target: {
        kind: 'local',
        serverUrl: '',
        booksId: 2,
        bookName: '目标账本',
      },
      imagePath: '',
    });
    mockResolveBookApi.mockResolvedValue({});
    mockResolveBookMedia.mockResolvedValue({});
    mockConfirmDraftItem.mockRejectedValue(new Error('记账类型不属于目标账本'));
    const recordVersionBefore = useSyncVersionStore.getState().recordVersion;
    const draftVersionBefore = useDraftVersionStore.getState().draftVersion;

    // Act & Assert
    await expect(
      saveAddRecordDraft(
        'expense',
        {
          booksId: 2,
          typeId: 1,
          selectedType: typeRow({}),
          amount: 1000,
          charge: 0,
          recordTime: NOW,
          remark: '',
          tagIds: [],
          imagePaths: [],
          relatedRecordIds: [],
        },
        undefined,
        { draft: { draftId: 'draft-1', itemIndex: 0, booksId: 2 } },
      ),
    ).rejects.toThrow('记账类型不属于目标账本');

    expect(useSyncVersionStore.getState().recordVersion).toBe(
      recordVersionBefore,
    );
    expect(useDraftVersionStore.getState().draftVersion).toBe(
      draftVersionBefore,
    );
  });
});
