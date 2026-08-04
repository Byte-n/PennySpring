import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  type IconValue,
  type TypeRow,
} from '@pennyspring/data';

import { validateAddRecordDraft } from '../src/screens/addRecord/addRecordDraft';
import { buildDraftFromTemplate, tabTypeFor } from '../src/screens/quickTemplate/buildDraft';
import type { QuickTemplate } from '../src/screens/quickTemplate/types';

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

function template(overrides: Partial<QuickTemplate>): QuickTemplate {
  return {
    id: 'tpl-1',
    booksId: 1,
    name: '模板',
    typeCategory: RECORD_TYPE_CATEGORY.expense,
    typeId: 1,
    amount: 600,
    charge: 0,
    remark: '',
    assetId: 10,
    intoAssetId: 0,
    reimbursable: false,
    tagIds: [],
    sort: 1,
    ...overrides,
  };
}

describe('quickTemplate buildDraft', () => {
  test('builds a valid expense draft from an expense template', () => {
    const expenseType = typeRow({ id: 1, typeCategory: RECORD_TYPE_CATEGORY.expense });
    const tpl = template({
      typeCategory: RECORD_TYPE_CATEGORY.expense,
      typeId: 1,
      amount: 600,
      assetId: 10,
      remark: '通勤',
      reimbursable: true,
    });

    const draft = buildDraftFromTemplate(tpl, 1, expenseType);

    expect(validateAddRecordDraft('expense', draft)).toBeUndefined();
    expect(draft.booksId).toBe(1);
    expect(draft.typeId).toBe(1);
    expect(draft.amount).toBe(600);
    expect(draft.assetId).toBe(10);
    expect(draft.reimbursable).toBe(true);
    expect(draft.remark).toBe('通勤');
    expect(draft.imagePaths).toEqual([]);
    expect(draft.relatedRecordIds).toEqual([]);
    expect(Number.isFinite(draft.recordTime) && draft.recordTime > 0).toBe(true);
  });

  test('builds a valid income draft from an income template', () => {
    const incomeType = typeRow({ id: 2, typeCategory: RECORD_TYPE_CATEGORY.income });
    const tpl = template({
      typeCategory: RECORD_TYPE_CATEGORY.income,
      typeId: 2,
      amount: 8800,
      assetId: 20,
    });

    const draft = buildDraftFromTemplate(tpl, 1, incomeType);

    expect(validateAddRecordDraft('income', draft)).toBeUndefined();
    expect(draft.typeId).toBe(2);
    expect(draft.amount).toBe(8800);
    expect(draft.assetId).toBe(20);
  });

  test('builds a valid transfer draft from a transfer template', () => {
    const transferType = typeRow({ id: 3, typeCategory: RECORD_TYPE_CATEGORY.transfer });
    const tpl = template({
      typeCategory: RECORD_TYPE_CATEGORY.transfer,
      typeId: 3,
      amount: 50000,
      assetId: 10,
      intoAssetId: 20,
    });

    const draft = buildDraftFromTemplate(tpl, 1, transferType);

    expect(validateAddRecordDraft('transfer', draft)).toBeUndefined();
    expect(draft.assetId).toBe(10);
    expect(draft.intoAssetId).toBe(20);
  });

  test('tabTypeFor maps type category to the matching add-record tab type', () => {
    expect(tabTypeFor(typeRow({ typeCategory: RECORD_TYPE_CATEGORY.expense }))).toBe('expense');
    expect(tabTypeFor(typeRow({ typeCategory: RECORD_TYPE_CATEGORY.income }))).toBe('income');
    expect(tabTypeFor(typeRow({ typeCategory: RECORD_TYPE_CATEGORY.transfer }))).toBe('transfer');
  });
});
