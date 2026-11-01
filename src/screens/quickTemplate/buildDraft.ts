import type { TypeRow } from '@pennyspring/api';

import type {
  AddRecordDraft,
  AddRecordTabType,
} from '../addRecord/addRecordDraft';
import type { QuickTemplate } from './types';

/**
 * 由类型大类映射到 AddRecord 页的 tab 类型。
 * RecordTypeCategoryValue 与 AddRecordTabType 同为 'expense' | 'income' | 'transfer'。
 */
export function tabTypeFor(typeRow: TypeRow): AddRecordTabType {
  return typeRow.typeCategory as AddRecordTabType;
}

/**
 * 由模板构造一条直接新建用的草稿。recordTime 取当前时刻，图片与关联记录留空。
 * assetId/intoAssetId 为 0 时归一化为 null，与 AddRecordContext.init 的口径一致。
 */
export function buildDraftFromTemplate(
  tpl: QuickTemplate,
  bookId: number,
  typeRow: TypeRow,
): AddRecordDraft {
  return {
    booksId: bookId,
    typeId: tpl.typeId,
    selectedType: typeRow,
    amount: tpl.amount,
    charge: tpl.charge,
    assetId: tpl.assetId > 0 ? tpl.assetId : null,
    intoAssetId: tpl.intoAssetId > 0 ? tpl.intoAssetId : null,
    reimbursable: tpl.reimbursable,
    recordTime: Date.now(),
    remark: tpl.remark,
    tagIds: tpl.tagIds,
    imagePaths: [],
    relatedRecordIds: [],
  };
}
