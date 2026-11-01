import {
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  SYSTEM_STATUS,
  type IconValue,
  type TypeRow,
} from '@pennyspring/data';
import {
  buildNewQuickTemplate,
  validateTemplateDraft,
} from '../src/screens/addRecord/templateDraft';
import type { AddRecordDraft } from '../src/screens/addRecord/addRecordDraft';

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

function draft(overrides: Partial<AddRecordDraft> = {}): AddRecordDraft {
  return {
    booksId: 1,
    typeId: 1,
    selectedType: typeRow({
      id: 1,
      typeCategory: RECORD_TYPE_CATEGORY.expense,
    }),
    amount: 600,
    charge: 0,
    assetId: 10,
    intoAssetId: 0,
    reimbursable: true,
    recordTime: NOW,
    remark: '通勤',
    tagIds: [5, 6],
    imagePaths: [],
    relatedRecordIds: [],
    ...overrides,
  };
}

describe('templateDraft', () => {
  describe('validateTemplateDraft', () => {
    test('rejects empty template name even when draft is valid', () => {
      expect(validateTemplateDraft('  ', 'expense', draft())).toBe(
        '请输入模板名称',
      );
    });

    test('passes when name and draft are valid', () => {
      expect(
        validateTemplateDraft('通勤支出', 'expense', draft()),
      ).toBeUndefined();
    });

    test('delegates draft validation when name is present', () => {
      expect(
        validateTemplateDraft('通勤支出', 'expense', draft({ amount: 0 })),
      ).toBe('请输入金额');
    });
  });

  describe('buildNewQuickTemplate', () => {
    test('maps expense tab to expense category and trims name', () => {
      const tpl = buildNewQuickTemplate('expense', draft(), {
        booksId: 1,
        name: ' 通勤支出 ',
      });

      expect(tpl.booksId).toBe(1);
      expect(tpl.name).toBe('通勤支出');
      expect(tpl.typeCategory).toBe(RECORD_TYPE_CATEGORY.expense);
      expect(tpl.typeId).toBe(1);
      expect(tpl.amount).toBe(600);
      expect(tpl.assetId).toBe(10);
      expect(tpl.intoAssetId).toBe(0);
      expect(tpl.reimbursable).toBe(true);
      expect(tpl.tagIds).toEqual([5, 6]);
    });

    test('falls back null asset ids to 0', () => {
      const tpl = buildNewQuickTemplate(
        'expense',
        draft({ assetId: null, intoAssetId: null }),
        {
          booksId: 1,
          name: '无资产',
        },
      );

      expect(tpl.assetId).toBe(0);
      expect(tpl.intoAssetId).toBe(0);
    });

    test('maps income tab to income category', () => {
      const incomeType = typeRow({
        id: 2,
        typeCategory: RECORD_TYPE_CATEGORY.income,
      });
      const tpl = buildNewQuickTemplate(
        'income',
        draft({ typeId: 2, selectedType: incomeType }),
        { booksId: 1, name: '工资' },
      );

      expect(tpl.typeCategory).toBe(RECORD_TYPE_CATEGORY.income);
    });

    test('maps transfer tab to transfer category', () => {
      const transferType = typeRow({
        id: 3,
        typeCategory: RECORD_TYPE_CATEGORY.transfer,
      });
      const tpl = buildNewQuickTemplate(
        'transfer',
        draft({ typeId: 3, selectedType: transferType }),
        { booksId: 1, name: '转账' },
      );

      expect(tpl.typeCategory).toBe(RECORD_TYPE_CATEGORY.transfer);
    });
  });
});
