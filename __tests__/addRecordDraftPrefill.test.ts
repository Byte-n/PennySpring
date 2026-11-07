import {
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  type DraftItem,
  type IconValue,
  type QuickBookDraftRow,
  type TypeRow,
} from '@pennyspring/api';

import { buildAddRecordInitFromDraft } from '../src/screens/addRecord/draftPrefill';

const NOW = new Date('2026-05-24T12:00:00+08:00').getTime();

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

function draftRow(
  overrides: Partial<QuickBookDraftRow> = {},
): QuickBookDraftRow {
  return {
    id: 'draft-1',
    booksId: 2,
    status: QUICK_BOOK_DRAFT_STATUS.pending,
    source: QUICK_BOOK_DRAFT_SOURCE.floatingCapture,
    imagePath: 'file://draft/screenshot.jpg',
    attachImage: true,
    items: [draftItem()],
    preset: { assetId: 0, typeId: 0 },
    agentProviderId: 0,
    agentModelId: '',
    agentSummary: '',
    errorText: '',
    confirmedCount: 0,
    recordIds: [],
    createdTime: NOW,
    updatedTime: NOW,
    confirmedAt: 0,
    ...overrides,
  };
}

function typeRow(overrides: Partial<TypeRow> = {}): TypeRow {
  return {
    id: 7,
    booksId: 2,
    parentId: 0,
    name: '餐饮',
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

describe('buildAddRecordInitFromDraft', () => {
  test('maps amount cents and charge cents into yuan-based form values', () => {
    // Arrange
    const draft = draftRow();
    const item = draftItem({ amountCents: 3650, chargeCents: 150 });

    // Act
    const prefill = buildAddRecordInitFromDraft(draft, item);

    // Assert
    expect(prefill.amount).toBe(3650);
    expect(prefill.charge).toBe(150);
  });

  test('maps a missing draft amount to zero so the calculator keeps a blank placeholder', () => {
    // Arrange
    const item = draftItem({ amountCents: null });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item);

    // Assert
    expect(prefill.amount).toBe(0);
  });

  test('normalizes zero asset ids to null and keeps assigned ids', () => {
    // Arrange
    const item = draftItem({ assetId: 5, intoAssetId: 0 });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item);

    // Assert
    expect(prefill.assetId).toBe(5);
    expect(prefill.intoAssetId).toBeNull();
  });

  test('maps record time, remark, tags and reimbursable flag unchanged', () => {
    // Arrange
    const recordTime = NOW - 60_000;
    const item = draftItem({
      recordTime,
      remark: '午餐',
      tagIds: [3, 4],
      reimbursable: true,
    });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item);

    // Assert
    expect(prefill.recordTime).toBe(recordTime);
    expect(prefill.remark).toBe('午餐');
    expect(prefill.tagIds).toEqual([3, 4]);
    expect(prefill.reimbursable).toBe(true);
  });

  test('leaves the type empty and defaults the tab to expense when the draft has no type', () => {
    // Arrange
    const item = draftItem({ typeId: 0 });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item, undefined);

    // Assert
    expect(prefill.typeId).toBeUndefined();
    expect(prefill.typeCategory).toBe(RECORD_TYPE_CATEGORY.expense);
  });

  test('uses the resolved type category and id from the target book', () => {
    // Arrange
    const item = draftItem({ typeId: 7 });
    const transferType = typeRow({
      id: 7,
      booksId: 2,
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
    });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item, transferType);

    // Assert
    expect(prefill.typeId).toBe(7);
    expect(prefill.typeCategory).toBe(RECORD_TYPE_CATEGORY.transfer);
  });

  test('ignores a resolved type that belongs to another book and defaults to expense', () => {
    // Arrange
    const item = draftItem({ typeId: 7 });
    const foreignType = typeRow({
      id: 7,
      booksId: 99,
      typeCategory: RECORD_TYPE_CATEGORY.income,
    });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item, foreignType);

    // Assert
    expect(prefill.typeCategory).toBe(RECORD_TYPE_CATEGORY.expense);
  });

  test('keeps both transfer asset ids', () => {
    // Arrange
    const item = draftItem({ assetId: 11, intoAssetId: 12 });

    // Act
    const prefill = buildAddRecordInitFromDraft(draftRow(), item);

    // Assert
    expect(prefill.assetId).toBe(11);
    expect(prefill.intoAssetId).toBe(12);
  });

  test('attaches the draft screenshot as a single local image', () => {
    // Arrange
    const draft = draftRow({ imagePath: 'file://draft/shot.png' });

    // Act
    const prefill = buildAddRecordInitFromDraft(draft, draftItem());

    // Assert
    expect(prefill.images).toEqual([{ uri: 'file://draft/shot.png' }]);
  });

  test('returns no images when the draft has no screenshot path', () => {
    // Act
    const prefill = buildAddRecordInitFromDraft(
      draftRow({ imagePath: '' }),
      draftItem(),
    );

    // Assert
    expect(prefill.images).toEqual([]);
  });

  test('returns no images when the draft attach switch is off', () => {
    // Act
    const prefill = buildAddRecordInitFromDraft(
      draftRow({ attachImage: false }),
      draftItem(),
    );

    // Assert
    expect(prefill.images).toEqual([]);
  });

  test('carries the draft target book id', () => {
    // Act
    const prefill = buildAddRecordInitFromDraft(
      draftRow({ booksId: 42 }),
      draftItem(),
    );

    // Assert
    expect(prefill.booksId).toBe(42);
  });
});
