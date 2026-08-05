import {
  RECORD_TYPE_CATEGORY,
  type RecordTypeCategoryValue,
} from '@pennyspring/api';
import {
  type AddRecordDraft,
  type AddRecordTabType,
  validateAddRecordDraft,
} from './addRecordDraft';
import type { NewQuickTemplate } from '../quickTemplate/types';

const TAB_CATEGORY: Record<AddRecordTabType, RecordTypeCategoryValue> = {
  expense: RECORD_TYPE_CATEGORY.expense,
  income: RECORD_TYPE_CATEGORY.income,
  transfer: RECORD_TYPE_CATEGORY.transfer,
};

/**
 * 校验模板草稿：模板名称非空 + 复用记录草稿校验。
 * 返回中文错误消息，校验通过返回 undefined。
 */
export function validateTemplateDraft(
  name: string,
  tabType: AddRecordTabType,
  draft: AddRecordDraft,
): string | undefined {
  if (name.trim() === '') {
    return '请输入模板名称';
  }
  return validateAddRecordDraft(tabType, draft);
}

/**
 * 由 AddRecord 草稿构造一份模板（NewQuickTemplate，不含 id/sort，由 store 补齐）。
 * assetId/intoAssetId 的 null/undefined 归一化为 0，与 QuickTemplate「0 代表空」一致。
 */
export function buildNewQuickTemplate(
  tabType: AddRecordTabType,
  draft: AddRecordDraft,
  opts: { booksId: number; name: string },
): NewQuickTemplate {
  return {
    booksId: opts.booksId,
    name: opts.name.trim(),
    typeCategory: TAB_CATEGORY[tabType],
    typeId: draft.typeId ?? 0,
    amount: draft.amount,
    charge: draft.charge,
    remark: draft.remark.trim(),
    assetId: draft.assetId ?? 0,
    intoAssetId: draft.intoAssetId ?? 0,
    reimbursable: draft.reimbursable === true,
    tagIds: draft.tagIds,
  };
}
