import dayjs from 'dayjs';
import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  SYSTEM_STATUS,
  VISIBILITY,
  type AssetRow,
  type RecordRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  resolveUpdateRecordInput,
  type UpdateRecordContext,
} from '../../src/agent/projection/recordUpdateDraft';
import type { RecordMetadata } from '../../src/agent/projection/recordDraft';

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

function recordRow(overrides: Partial<RecordRow> = {}): RecordRow {
  return {
    id: 100,
    typeId: 2,
    assetId: 20,
    intoAssetId: 0,
    booksId: 1,
    amount: 3000,
    finalAmount: 3000,
    charge: 0,
    remark: '午饭',
    reimbursable: REIMBURSABLE.notReimbursable,
    recordTime: NOW,
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  } as RecordRow;
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
        id: 4,
        name: '退款',
        typeCategory: RECORD_TYPE_CATEGORY.income,
        specialBehavior: RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption,
      }),
      typeRow({
        id: 5,
        name: '帐户互转',
        typeCategory: RECORD_TYPE_CATEGORY.transfer,
      }),
    ],
    tags: [
      tagRow({ id: 10, name: '朋友' }),
      tagRow({ id: 11, name: '隐藏标签', invisible: VISIBILITY.hidden }),
    ],
    assets: [
      assetRow({ id: 20, name: '现金' }),
      assetRow({ id: 21, name: '储蓄卡' }),
      assetRow({
        id: 22,
        name: '隐藏资产',
        invisible: VISIBILITY.hidden,
      }),
    ],
    ...overrides,
  };
}

function context(
  overrides: Partial<UpdateRecordContext> = {},
): UpdateRecordContext {
  return {
    record: recordRow(),
    tagIds: [10],
    imagePaths: ['file://a.jpg'],
    ...overrides,
  };
}

describe('resolveUpdateRecordInput', () => {
  it('keeps untouched fields and only applies the provided amount', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, amount: 35 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.updateInput).toEqual(
      expect.objectContaining({
        id: 100,
        booksId: 1,
        typeId: 2,
        amount: 3500,
        charge: 0,
        remark: '午饭',
        assetId: 20,
        reimbursable: REIMBURSABLE.notReimbursable,
        tagIds: [10],
        imagePaths: ['file://a.jpg'],
        recordTime: NOW,
      }),
    );
    expect(result.changes.map(change => change.field)).toEqual(['amount']);
    expect(result.changes[0]).toEqual({
      field: 'amount',
      label: '金额',
      before: '¥30.00',
      after: '¥35.00',
    });
  });

  it('changes only the date while keeping the original time', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, date: '2026-10-01' },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(dayjs(result.updateInput.recordTime).format('YYYY-MM-DD HH:mm')).toBe(
      '2026-10-01 12:34',
    );
  });

  it('replaces all tags when tagIds are provided', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, tagIds: [] },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.updateInput.tagIds).toEqual([]);
    expect(result.changes.map(change => change.field)).toContain('tags');
  });

  it('preserves hidden tags when tagIds are omitted', () => {
    const result = resolveUpdateRecordInput(
      1,
      context({ tagIds: [11] }),
      { recordId: 100, amount: 31 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.updateInput.tagIds).toEqual([11]);
    }
  });

  it('rejects a hidden tag selected by the model', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, tagIds: [11] },
      metadata(),
    );

    expect(result).toEqual({
      ok: false,
      error: '标签“隐藏标签”已隐藏，不能使用',
    });
  });

  it('keeps existing images and appends the new ones', () => {
    const result = resolveUpdateRecordInput(
      1,
      context({ addedImagePaths: ['file://b.jpg', 'file://a.jpg'] }),
      { recordId: 100, remark: '工作餐' },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.updateInput.imagePaths).toEqual([
      'file://a.jpg',
      'file://b.jpg',
    ]);
    expect(result.changes.map(change => change.field)).toEqual([
      'remark',
      'images',
    ]);
  });

  it('drops the destination asset when a transfer becomes an expense', () => {
    const result = resolveUpdateRecordInput(
      1,
      context({
        record: recordRow({ typeId: 5, intoAssetId: 21, amount: 5000 }),
      }),
      { recordId: 100, typeId: 2, amount: 30 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.updateInput.assetId).toBe(20);
    expect(result.updateInput).not.toHaveProperty('intoAssetId');
    expect(result.changes.map(change => change.field)).toContain('category');
  });

  it('requires a destination asset when an expense becomes a transfer', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, typeId: 5 },
      metadata(),
    );

    expect(result).toEqual({
      ok: false,
      error: '转账必须指定转入资产',
    });
  });

  it('accepts a destination asset when an expense becomes a transfer', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, typeId: 5, intoAssetId: 21 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.updateInput.assetId).toBe(20);
      expect(result.updateInput.intoAssetId).toBe(21);
    }
  });

  it('rejects editing a refund or reimbursement record', () => {
    const result = resolveUpdateRecordInput(
      1,
      context({ record: recordRow({ typeId: 4 }) }),
      { recordId: 100, amount: 30 },
      metadata(),
    );

    expect(result).toEqual({
      ok: false,
      error: '退款/报销记录暂不支持在助手中修改，请在 App 内操作',
    });
  });

  it('reports no changes when the input matches the record', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.changes).toEqual([]);
    }
  });

  it('preserves a hidden asset when assetId is omitted', () => {
    const result = resolveUpdateRecordInput(
      1,
      context({ record: recordRow({ assetId: 22 }) }),
      { recordId: 100, amount: 31 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.updateInput.assetId).toBe(22);
    }
  });

  it('clears the asset when assetId is 0', () => {
    const result = resolveUpdateRecordInput(
      1,
      context(),
      { recordId: 100, assetId: 0 },
      metadata(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.updateInput.assetId).toBe(0);
    expect(result.changes.map(change => change.field)).toContain('asset');
  });

  it('rejects records that belong to another book', () => {
    const result = resolveUpdateRecordInput(
      1,
      context({ record: recordRow({ booksId: 2 }) }),
      { recordId: 100, amount: 30 },
      metadata(),
    );

    expect(result).toEqual({
      ok: false,
      error: '记录 100 不属于当前账本',
    });
  });
});
