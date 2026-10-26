import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  type AssetRow,
  type CreateRecordInput,
  type RecordRow,
  RECORD_TYPE_CATEGORY,
  type RecordTypeCategoryValue,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  type TypeRow,
  VISIBILITY,
} from '@pennyspring/api';
import { getGlobalApi } from '../../stores/bookStore';

export type AddRecordTabType = 'expense' | 'income' | 'transfer';
export type TransferAssetRole = 'from' | 'to';

const CENTS_PER_YUAN = 100;

export interface AddRecordDraft {
  booksId?: number;
  typeId?: number;
  selectedType?: TypeRow;
  amount: number;
  charge: number;
  assetId?: number | null;
  intoAssetId?: number | null;
  reimbursable?: boolean;
  recordTime: number;
  remark: string;
  tagIds: number[];
  imagePaths: string[];
  relatedRecordIds: number[];
}

export function normalizeMoneyTextToCents(text: string): number {
  const amount = Number.parseFloat(text.trim());
  if (!Number.isFinite(amount)) {
    return 0;
  }

  return yuanToCents(amount);
}

export function yuanToCents(amount: number): number {
  return Math.round(amount * CENTS_PER_YUAN);
}

export function formatAmount(cents: number | undefined): string {
  return ((cents ?? 0) / CENTS_PER_YUAN).toFixed(2);
}

const TRAILING_ZEROS_PATTERN = /0+$/;
const DECIMAL_POINT = '.';

/**
 * 把分格式化为计算器表达式文本，去掉无意义的尾随零。
 * 0 或非法值返回空串，让 CalculatorInput 显示占位符。
 */
export function formatCentsAsExpression(cents: number): string {
  if (!Number.isFinite(cents) || cents <= 0) {
    return '';
  }

  const amountText = formatAmount(cents).replace(TRAILING_ZEROS_PATTERN, '');

  return amountText.endsWith(DECIMAL_POINT)
    ? amountText.slice(0, -1)
    : amountText;
}

export function isAbsorptionIncomeType(
  typeRow: TypeRow | undefined,
): typeRow is TypeRow {
  return (
    typeRow?.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption ||
    typeRow?.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption
  );
}

function getExpectedCategory(tabType: AddRecordTabType): RecordTypeCategoryValue {
  if (tabType === 'expense') return RECORD_TYPE_CATEGORY.expense;
  if (tabType === 'income') return RECORD_TYPE_CATEGORY.income;
  return RECORD_TYPE_CATEGORY.transfer;
}

function compactIds(ids: number[]): number[] {
  return Array.from(new Set(ids.filter(id => id > 0)));
}

function hasRequiredId(value: number | null | undefined): value is number {
  return value !== undefined && value !== null && value > 0;
}

export function validateAddRecordDraft(
  tabType: AddRecordTabType,
  draft: AddRecordDraft,
): string | undefined {
  if (!hasRequiredId(draft.booksId)) return '未找到当前账本';
  if (draft.amount <= 0) return '请输入金额';
  if (draft.charge < 0) return '手续费不能小于 0';
  if (!hasRequiredId(draft.typeId) || draft.selectedType === undefined) {
    return '请选择分类';
  }

  if (draft.selectedType.typeCategory !== getExpectedCategory(tabType)) {
    return '分类与记录类型不匹配';
  }

  if (tabType === 'transfer') {
    if (!hasRequiredId(draft.assetId)) return '请选择转出资产';
    if (!hasRequiredId(draft.intoAssetId)) return '请选择转入资产';
    if (draft.assetId === draft.intoAssetId) {
      return '转出资产和转入资产不能相同';
    }
    return undefined;
  }

  if (tabType === 'income') {
    if (
      isAbsorptionIncomeType(draft.selectedType) &&
      compactIds(draft.relatedRecordIds).length === 0
    ) {
      return '请选择关联支出';
    }
  }

  return undefined;
}

export function buildCreateRecordInput(
  tabType: AddRecordTabType,
  draft: AddRecordDraft,
): CreateRecordInput {
  const validationMessage = validateAddRecordDraft(tabType, draft);
  if (validationMessage !== undefined) {
    throw new Error(validationMessage);
  }

  const baseInput = {
    typeId: draft.typeId!,
    booksId: draft.booksId!,
    amount: draft.amount,
    charge: draft.charge,
    remark: draft.remark.trim(),
    recordTime: draft.recordTime,
    tagIds: compactIds(draft.tagIds),
    imagePaths: draft.imagePaths,
  };

  if (tabType === 'expense') {
    return {
      ...baseInput,
      assetId: draft.assetId ?? 0,
      reimbursable: draft.reimbursable === true
        ? REIMBURSABLE.reimbursable
        : REIMBURSABLE.notReimbursable,
    };
  }

  if (tabType === 'income') {
    const relatedRecordIds = compactIds(draft.relatedRecordIds);
    return {
      ...baseInput,
      assetId: draft.assetId ?? 0,
      reimbursable: REIMBURSABLE.notReimbursable,
      relatedRecordIds,
    };
  }

  return {
    ...baseInput,
    assetId: draft.assetId!,
    intoAssetId: draft.intoAssetId!,
    reimbursable: REIMBURSABLE.notReimbursable,
  };
}

export async function saveAddRecordDraft(
  tabType: AddRecordTabType,
  draft: AddRecordDraft,
  editingRecordId: number | undefined,
): Promise<void> {
  const input = buildCreateRecordInput(tabType, draft);
  const api = getGlobalApi();
  if (editingRecordId !== undefined) {
    await api.record.update({ ...input, id: editingRecordId });
    return;
  }
  await api.record.create(input);
}

function isVisibleAsset(asset: AssetRow): boolean {
  return asset.invisible !== VISIBILITY.hidden;
}

function isBorrowDebtAsset(asset: AssetRow): boolean {
  return asset.type === ASSET_TYPE.debt && asset.classification === ASSET_CLASSIFICATION.borrow;
}

function isLendDebtAsset(asset: AssetRow): boolean {
  return asset.type === ASSET_TYPE.debt && asset.classification === ASSET_CLASSIFICATION.lend;
}

function isCapitalAsset(asset: AssetRow): boolean {
  return asset.type === ASSET_TYPE.capitalAccount;
}

export function filterTransferAssets(
  assets: AssetRow[],
  typeRow: TypeRow | undefined,
  role: TransferAssetRole,
): AssetRow[] {
  const visibleAssets = assets.filter(isVisibleAsset);

  switch (typeRow?.specialBehavior) {
    case RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment:
      return role === 'to'
        ? visibleAssets.filter(asset => asset.type === ASSET_TYPE.creditCard)
        : visibleAssets;
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow:
      return role === 'from'
        ? visibleAssets.filter(isBorrowDebtAsset)
        : visibleAssets.filter(isCapitalAsset);
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtLend:
      return role === 'from'
        ? visibleAssets.filter(isCapitalAsset)
        : visibleAssets.filter(isLendDebtAsset);
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtRepayment:
      return role === 'from'
        ? visibleAssets.filter(isCapitalAsset)
        : visibleAssets.filter(isBorrowDebtAsset);
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtProceeds:
      return role === 'from'
        ? visibleAssets.filter(isLendDebtAsset)
        : visibleAssets.filter(isCapitalAsset);
    default:
      return visibleAssets;
  }
}

export function getRelatedExpenseCandidates(
  records: RecordRow[],
  expenseTypes: TypeRow[],
  selectedIncomeType: TypeRow | undefined,
): RecordRow[] {
  if (!isAbsorptionIncomeType(selectedIncomeType)) {
    return [];
  }

  const expenseTypeIds = new Set(
    expenseTypes
      .filter(typeRow => typeRow.typeCategory === RECORD_TYPE_CATEGORY.expense)
      .map(typeRow => typeRow.id),
  );
  const requiredReimbursable = selectedIncomeType.specialBehavior ===
    RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption
    ? REIMBURSABLE.reimbursable
    : REIMBURSABLE.notReimbursable;

  return records.filter(record => (
    expenseTypeIds.has(record.typeId) &&
    record.reimbursable === requiredReimbursable
  ));
}
