import {
  RECORD_TYPE_CATEGORY,
  type DraftItem,
  type QuickBookDraftRow,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';
import type { ImagePickerValue } from '@pennyspring/ui';

/** 草稿目标：由草稿详情“确认”进入 AddRecord 时携带的目标账本与笔序号。 */
export interface AddRecordDraftTarget {
  draftId: string;
  itemIndex: number;
  booksId: number;
}

/** 草稿单笔转换后的 AddRecord 预填值；金额仍以分存储。 */
export interface AddRecordDraftPrefill {
  booksId: number;
  typeId?: number;
  typeCategory: RecordTypeCategoryValue;
  amount: number;
  charge: number;
  assetId: number | null;
  intoAssetId: number | null;
  reimbursable: boolean;
  recordTime: number;
  remark: string;
  tagIds: number[];
  images: ImagePickerValue[];
}

export interface AddRecordDraftInitPayload
  extends AddRecordDraftPrefill, AddRecordDraftTarget {}

function resolveTypeCategory(
  draft: QuickBookDraftRow,
  type: TypeRow | null | undefined,
): RecordTypeCategoryValue {
  if (type === null || type === undefined || type.booksId !== draft.booksId) {
    return RECORD_TYPE_CATEGORY.expense;
  }
  return type.typeCategory;
}

/**
 * 把草稿逐笔转换为新建记录页预填值（纯映射，不读写存储）。
 * type 必须是目标账本内的类型行；缺失时按支出展示并留空类型。
 */
export function buildAddRecordInitFromDraft(
  draft: QuickBookDraftRow,
  item: DraftItem,
  type?: TypeRow | null,
): AddRecordDraftPrefill {
  return {
    booksId: draft.booksId,
    typeId: item.typeId > 0 ? item.typeId : undefined,
    typeCategory: resolveTypeCategory(draft, type),
    amount: item.amountCents ?? 0,
    charge: item.chargeCents,
    assetId: item.assetId > 0 ? item.assetId : null,
    intoAssetId: item.intoAssetId > 0 ? item.intoAssetId : null,
    reimbursable: item.reimbursable,
    recordTime: item.recordTime,
    remark: item.remark,
    tagIds: [...item.tagIds],
    images:
      (item.attachImage ?? draft.attachImage) && draft.imagePath
        ? [{ uri: draft.imagePath }]
        : [],
  };
}
