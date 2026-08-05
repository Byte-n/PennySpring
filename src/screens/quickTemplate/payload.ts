import type {
  AddRecordPresetPayload,
  AddRecordTemplatePayload,
} from '../addRecord/AddRecordContext';
import type { QuickTemplate } from './types';

/**
 * 模板 → 预填载荷（「长按预填后新建记录」流程）。
 * assetId/intoAssetId 的 0 归一化为 null，与 AddRecordContext.initFromPreset 口径一致。
 */
export function toPresetPayload(tpl: QuickTemplate): AddRecordPresetPayload {
  return {
    typeId: tpl.typeId,
    amount: tpl.amount,
    remark: tpl.remark,
    assetId: tpl.assetId > 0 ? tpl.assetId : null,
    intoAssetId: tpl.intoAssetId > 0 ? tpl.intoAssetId : null,
    charge: tpl.charge,
    reimbursable: tpl.reimbursable,
    tagIds: tpl.tagIds,
  };
}

/**
 * 模板 → 模板编辑载荷（「以 AddRecord 编辑模板」流程）。
 * assetId/intoAssetId 的 0 归一化为 null，与 AddRecordContext.initFromTemplate 口径一致。
 */
export function toTemplatePayload(tpl: QuickTemplate): AddRecordTemplatePayload {
  return {
    id: tpl.id,
    name: tpl.name,
    typeCategory: tpl.typeCategory,
    typeId: tpl.typeId,
    amount: tpl.amount,
    charge: tpl.charge,
    remark: tpl.remark,
    assetId: tpl.assetId > 0 ? tpl.assetId : null,
    intoAssetId: tpl.intoAssetId > 0 ? tpl.intoAssetId : null,
    reimbursable: tpl.reimbursable,
    tagIds: tpl.tagIds,
  };
}
