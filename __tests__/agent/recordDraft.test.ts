import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  VISIBILITY,
  type AssetRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  resolveCreateRecordInput,
  type RecordMetadata,
} from '../../src/agent/projection/recordDraft';

const NOW = new Date(2026, 9, 30, 12, 34).getTime();

function typeRow(
  overrides: Partial<TypeRow> & Pick<TypeRow, 'id' | 'name' | 'typeCategory'>,
): TypeRow {
  return {
    booksId: 1,
    parentId: 0,
    icon: '',
    isSystem: SYSTEM_STATUS.custom,
    specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.none,
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as TypeRow;
}

function tagRow(
  overrides: Partial<TagRow> & Pick<TagRow, 'id' | 'name'>,
): TagRow {
  return {
    booksId: 1,
    invisible: VISIBILITY.visible,
    icon: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as TagRow;
}

function assetRow(
  overrides: Partial<AssetRow> & Pick<AssetRow, 'id' | 'name'>,
): AssetRow {
  return {
    booksId: 1,
    balance: 0,
    totalAmount: 0,
    billingDate: 0,
    repaymentDate: 0,
    type: ASSET_TYPE.capitalAccount,
    classification: ASSET_CLASSIFICATION.cash,
    invisible: VISIBILITY.visible,
    openBank: '',
    cardNo: '',
    remark: '',
    sort: 1,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as AssetRow;
}

function metadata(overrides: Partial<RecordMetadata> = {}): RecordMetadata {
  return {
    types: [
      typeRow({
        id: 1,
        name: '餐饮',
        typeCategory: RECORD_TYPE_CATEGORY.expense,
      }),
      typeRow({
        id: 2,
        name: '三餐',
        parentId: 1,
        typeCategory: RECORD_TYPE_CATEGORY.expense,
      }),
      typeRow({
        id: 3,
        name: '薪资',
        typeCategory: RECORD_TYPE_CATEGORY.income,
      }),
      typeRow({
        id: 4,
        name: '退还',
        typeCategory: RECORD_TYPE_CATEGORY.income,
        specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
      }),
      typeRow({
        id: 5,
        name: '帐户互转',
        typeCategory: RECORD_TYPE_CATEGORY.transfer,
      }),
      typeRow({
        id: 6,
        name: '还信用卡',
        typeCategory: RECORD_TYPE_CATEGORY.transfer,
        specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment,
      }),
    ],
    tags: [tagRow({ id: 10, name: '朋友' })],
    assets: [
      assetRow({ id: 20, name: '现金' }),
      assetRow({
        id: 21,
        name: '信用卡',
        type: ASSET_TYPE.creditCard,
        classification: ASSET_CLASSIFICATION.creditCard,
      }),
    ],
    ...overrides,
  };
}

describe('resolveCreateRecordInput', () => {
  it('builds an expense input with yuan converted to cents', () => {
    const result = resolveCreateRecordInput(
      1,
      {
        typeId: 2,
        amount: 30.5,
        remark: ' 午饭 ',
        tagIds: [10],
      },
      metadata(),
      NOW,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.draft.category).toBe(RECORD_TYPE_CATEGORY.expense);
    expect(result.draft.categoryLabel).toBe('支出');
    expect(result.draft.typePath).toBe('餐饮 / 三餐');
    expect(result.draft.amountCents).toBe(3050);
    expect(result.draft.remark).toBe('午饭');
    expect(result.draft.createInput).toEqual(
      expect.objectContaining({
        typeId: 2,
        booksId: 1,
        amount: 3050,
        charge: 0,
        assetId: 0,
        reimbursable: REIMBURSABLE.notReimbursable,
        tagIds: [10],
      }),
    );
  });

  it('marks an expense as reimbursable when requested', () => {
    const result = resolveCreateRecordInput(
      1,
      { typeId: 2, amount: 30, reimbursable: true },
      metadata(),
      NOW,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.isReimbursable).toBe(true);
      expect(result.draft.createInput).toEqual(
        expect.objectContaining({
          reimbursable: REIMBURSABLE.reimbursable,
        }),
      );
    }
  });

  it('rejects amounts with more than two decimals', () => {
    const result = resolveCreateRecordInput(
      1,
      { typeId: 2, amount: 1.005 },
      metadata(),
      NOW,
    );

    expect(result).toEqual({
      ok: false,
      error: '金额最多支持两位小数',
    });
  });

  it('rejects parent types', () => {
    const result = resolveCreateRecordInput(
      1,
      { typeId: 1, amount: 10 },
      metadata(),
      NOW,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('下还有子类型');
    }
  });

  it('rejects tags that are hidden or belong to another book', () => {
    const hidden = resolveCreateRecordInput(
      1,
      { typeId: 2, amount: 10, tagIds: [11] },
      metadata({
        tags: [
          tagRow({
            id: 11,
            name: '隐藏标签',
            invisible: VISIBILITY.hidden,
          }),
        ],
      }),
      NOW,
    );
    expect(hidden.ok).toBe(false);

    const otherBook = resolveCreateRecordInput(
      1,
      { typeId: 2, amount: 10, tagIds: [12] },
      metadata({ tags: [tagRow({ id: 12, name: '别人的标签', booksId: 2 })] }),
      NOW,
    );
    expect(otherBook.ok).toBe(false);
  });

  it('rejects absorption income types', () => {
    const result = resolveCreateRecordInput(
      1,
      { typeId: 4, amount: 10 },
      metadata(),
      NOW,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('暂不支持');
    }
  });

  it('rejects income when the charge exceeds the amount', () => {
    const result = resolveCreateRecordInput(
      1,
      { typeId: 3, amount: 10, charge: 11 },
      metadata(),
      NOW,
    );

    expect(result).toEqual({
      ok: false,
      error: '手续费不能大于收入金额',
    });
  });

  it('requires both transfer assets and rejects identical assets', () => {
    const missing = resolveCreateRecordInput(
      1,
      { typeId: 5, amount: 100, assetId: 20 },
      metadata(),
      NOW,
    );
    expect(missing.ok).toBe(false);

    const same = resolveCreateRecordInput(
      1,
      { typeId: 5, amount: 100, assetId: 20, intoAssetId: 20 },
      metadata(),
      NOW,
    );
    expect(same.ok).toBe(false);
    if (!same.ok) {
      expect(same.error).toContain('不能相同');
    }
  });

  it('validates special transfer asset types', () => {
    const valid = resolveCreateRecordInput(
      1,
      { typeId: 6, amount: 100, assetId: 20, intoAssetId: 21 },
      metadata(),
      NOW,
    );
    expect(valid.ok).toBe(true);

    const invalid = resolveCreateRecordInput(
      1,
      { typeId: 6, amount: 100, assetId: 21, intoAssetId: 20 },
      metadata(),
      NOW,
    );
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.error).toContain('转入资产是信用卡');
    }
  });

  it('uses the supplied date and time', () => {
    const result = resolveCreateRecordInput(
      1,
      { typeId: 2, amount: 10, date: '2026-10-29', time: '08:05' },
      metadata(),
      NOW,
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.draft.recordTime).toBe(
        new Date(2026, 9, 29, 8, 5).getTime(),
      );
    }
  });
});
