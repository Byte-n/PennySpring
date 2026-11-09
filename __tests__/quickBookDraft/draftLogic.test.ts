import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  type DraftItem,
  type TypeRow,
} from '@pennyspring/api';

import {
  buildDraftConfirmInput,
  formatDraftAmount,
  formatDraftItemTime,
  formatDraftTimestamp,
  getDraftItemMissingLabels,
  getDraftItemWarningTexts,
  isDraftItemComplete,
  summarizeDraftTotals,
} from '../../src/features/quickBookDraft/draftLogic';

function createType(overrides: Partial<TypeRow> = {}): TypeRow {
  return {
    id: 11,
    booksId: 1,
    parentId: 0,
    name: '午餐',
    icon: 'ForkKnife',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    isSystem: 'custom',
    specialBehavior: '',
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  };
}

function createItem(overrides: Partial<DraftItem> = {}): DraftItem {
  return {
    status: 'pending',
    recordId: 0,
    typeId: 11,
    typeName: '午餐',
    amountCents: 3650,
    recordTime: new Date(2026, 10, 4, 12, 30).getTime(),
    remark: '美团外卖',
    assetId: 21,
    assetName: '微信零钱',
    intoAssetId: 0,
    intoAssetName: '',
    chargeCents: 0,
    tagIds: [],
    reimbursable: false,
    warnings: [],
    ...overrides,
  };
}

describe('formatDraftAmount', () => {
  it('shows a missing-amount label when amount is null', () => {
    expect(formatDraftAmount(null)).toBe('金额待确认');
  });

  it('formats cents as yuan with two decimals and grouping', () => {
    expect(formatDraftAmount(3650)).toBe('¥36.50');
    expect(formatDraftAmount(123456)).toBe('¥1,234.56');
  });
});

describe('formatDraftTimestamp', () => {
  it('returns time only for the same day', () => {
    const now = new Date(2026, 10, 4, 18, 0).getTime();
    const time = new Date(2026, 10, 4, 12, 34).getTime();

    expect(formatDraftTimestamp(time, now)).toBe('12:34');
  });

  it('prefixes month and day for other days', () => {
    const now = new Date(2026, 10, 5, 9, 0).getTime();
    const time = new Date(2026, 10, 4, 12, 34).getTime();

    expect(formatDraftTimestamp(time, now)).toBe('11-04 12:34');
  });
});

describe('formatDraftItemTime', () => {
  it('returns time only when the item shares the card day', () => {
    const reference = new Date(2026, 10, 4, 18, 0).getTime();
    const itemTime = new Date(2026, 10, 4, 12, 34).getTime();

    expect(formatDraftItemTime(itemTime, reference)).toBe('12:34');
  });

  it('prefixes month and day when the item is on another day', () => {
    const reference = new Date(2026, 10, 5, 9, 0).getTime();
    const itemTime = new Date(2026, 10, 4, 12, 34).getTime();

    expect(formatDraftItemTime(itemTime, reference)).toBe('11-04 12:34');
  });
});

describe('summarizeDraftTotals', () => {
  const expenseType = createType({ id: 11, name: '午餐' });
  const incomeType = createType({
    id: 12,
    name: '工资',
    typeCategory: RECORD_TYPE_CATEGORY.income,
  });
  const transferType = createType({
    id: 13,
    name: '转账',
    typeCategory: RECORD_TYPE_CATEGORY.transfer,
  });
  const typesById = new Map<number, TypeRow>(
    [expenseType, incomeType, transferType].map(type => [type.id, type]),
  );

  it('splits expense, income and transfer without mixing them', () => {
    const totals = summarizeDraftTotals(
      [
        createItem({ typeId: 11, amountCents: 3650 }),
        createItem({ typeId: 12, amountCents: 500000 }),
        createItem({ typeId: 13, amountCents: 100000 }),
      ],
      typesById,
      1,
    );

    expect(totals).toEqual({
      expenseCents: 3650,
      incomeCents: 500000,
      transferCents: 100000,
      pendingAmountCount: 0,
      unclassifiedCount: 0,
      itemCount: 3,
    });
  });

  it('excludes missing amounts and unclassified types from totals', () => {
    const totals = summarizeDraftTotals(
      [
        createItem({ typeId: 11, amountCents: null }),
        createItem({ typeId: 99, amountCents: 1000 }),
      ],
      typesById,
      1,
    );

    expect(totals.expenseCents).toBe(0);
    expect(totals.pendingAmountCount).toBe(1);
    expect(totals.unclassifiedCount).toBe(1);
    expect(totals.itemCount).toBe(2);
  });

  it('counts a type from another book as unclassified', () => {
    const totals = summarizeDraftTotals(
      [createItem({ typeId: 11, amountCents: 1000 })],
      new Map([[11, createType({ booksId: 2 })]]),
      1,
    );

    expect(totals.expenseCents).toBe(0);
    expect(totals.unclassifiedCount).toBe(1);
  });
});

describe('getDraftItemWarningTexts', () => {
  it('keeps model warnings and adds derived warnings without duplicating chips', () => {
    const type = createType({
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      name: '转账',
    });
    const item = createItem({
      typeId: type.id,
      amountCents: null,
      assetId: 21,
      intoAssetId: 21,
      recordTime: 0,
      warnings: ['金额不合法，已留空待确认', '模型提示', '模型提示'],
    });

    expect(getDraftItemWarningTexts(item, type, 1)).toEqual([
      '金额不合法，已留空待确认',
      '模型提示',
      '时间不合法',
      '转出与转入资产不能相同',
    ]);
  });

  it('returns an empty list when there is nothing to warn about', () => {
    expect(getDraftItemWarningTexts(createItem(), createType(), 1)).toEqual([]);
  });

  it('warns that absorption income needs a related expense', () => {
    const type = createType({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
      name: '退款到账',
    });

    expect(
      getDraftItemWarningTexts(createItem({ typeId: type.id }), type, 1),
    ).toEqual(['退款/报销类收入必须关联一笔支出']);
  });
});

describe('isDraftItemComplete', () => {
  it('accepts an expense with a valid type, positive amount and time', () => {
    expect(isDraftItemComplete(createItem(), createType(), 1)).toBe(true);
  });

  it('rejects an item without amount', () => {
    expect(
      isDraftItemComplete(createItem({ amountCents: null }), createType(), 1),
    ).toBe(false);
  });

  it('rejects a type that belongs to another book', () => {
    expect(
      isDraftItemComplete(createItem(), createType({ booksId: 2 }), 1),
    ).toBe(false);
  });

  it('accepts a transfer with two distinct assets', () => {
    const type = createType({
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      name: '转账',
    });
    const item = createItem({
      typeId: type.id,
      assetId: 21,
      intoAssetId: 22,
    });

    expect(isDraftItemComplete(item, type, 1)).toBe(true);
  });

  it('rejects a transfer with the same outgoing and incoming asset', () => {
    const type = createType({ typeCategory: RECORD_TYPE_CATEGORY.transfer });
    const item = createItem({ typeId: type.id, assetId: 21, intoAssetId: 21 });

    expect(isDraftItemComplete(item, type, 1)).toBe(false);
  });
});

describe('getDraftItemMissingLabels', () => {
  it('lists missing type and amount', () => {
    const labels = getDraftItemMissingLabels(
      createItem({ typeId: 0, amountCents: null }),
      null,
      1,
    );

    expect(labels).toEqual(['待选择类型', '金额待确认']);
  });

  it('lists transfer asset problems', () => {
    const type = createType({ typeCategory: RECORD_TYPE_CATEGORY.transfer });
    const item = createItem({
      typeId: type.id,
      assetId: 0,
      intoAssetId: 0,
    });

    expect(getDraftItemMissingLabels(item, type, 1)).toEqual([
      '缺少转出资产',
      '缺少转入资产',
    ]);
  });

  it('requires a related expense for absorption income', () => {
    const type = createType({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption,
      name: '报销到账',
    });
    const item = createItem({ typeId: type.id });

    expect(getDraftItemMissingLabels(item, type, 1)).toEqual(['需关联支出']);
    expect(isDraftItemComplete(item, type, 1)).toBe(false);
  });
});

describe('buildDraftConfirmInput', () => {
  it('maps a cashflow draft into a full create-record input', () => {
    const type = createType();
    const item = createItem({ reimbursable: true });

    const input = buildDraftConfirmInput({
      item,
      type,
      booksId: 1,
      imagePaths: ['file:///media/draft.jpg'],
    });

    expect(input).toEqual({
      booksId: 1,
      typeId: type.id,
      amount: 3650,
      charge: 0,
      remark: '美团外卖',
      recordTime: item.recordTime,
      tagIds: [],
      imagePaths: ['file:///media/draft.jpg'],
      assetId: 21,
      reimbursable: REIMBURSABLE.reimbursable,
    });
  });

  it('maps a transfer draft with outgoing and incoming assets', () => {
    const type = createType({
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      name: '转账',
    });
    const item = createItem({
      typeId: type.id,
      assetId: 21,
      intoAssetId: 22,
    });

    const input = buildDraftConfirmInput({
      item,
      type,
      booksId: 1,
      imagePaths: [],
    });

    expect(input).toMatchObject({
      typeId: type.id,
      assetId: 21,
      intoAssetId: 22,
    });
    expect(input).not.toHaveProperty('reimbursable');
  });

  it('throws when the amount is missing', () => {
    expect(() =>
      buildDraftConfirmInput({
        item: createItem({ amountCents: null }),
        type: createType(),
        booksId: 1,
        imagePaths: [],
      }),
    ).toThrow('金额必须大于 0');
  });
});
