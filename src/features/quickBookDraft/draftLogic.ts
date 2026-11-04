import {
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type CreateRecordInput,
  type DraftItem,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';

export const DRAFT_MISSING_AMOUNT_TEXT = '金额待确认';
export const DRAFT_MISSING_TYPE_TEXT = '待选择类型';

const CENTS_PER_YUAN = 100;
const DEFAULT_AMOUNT_DECIMAL = '00';

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

function formatInteger(integer: string): string {
  return Number(integer).toLocaleString('zh-CN');
}

function isValidRecordTime(recordTime: number): boolean {
  return (
    Number.isInteger(recordTime) && recordTime > 0 && !Number.isNaN(recordTime)
  );
}

/** 草稿金额展示：null 表示金额待确认，其余与记录金额一致（元、两位小数）。 */
export function formatDraftAmount(amountCents: number | null): string {
  if (amountCents === null) {
    return DRAFT_MISSING_AMOUNT_TEXT;
  }
  const parts = formatDraftAmountParts(amountCents);
  return `¥${parts.integer}.${parts.decimal}`;
}

export interface DraftAmountParts {
  integer: string;
  decimal: string;
}

export function formatDraftAmountParts(amountCents: number): DraftAmountParts {
  const [integer, decimal] = (Math.abs(amountCents) / CENTS_PER_YUAN)
    .toFixed(2)
    .split('.');
  return {
    integer: formatInteger(integer ?? '0'),
    decimal: decimal ?? DEFAULT_AMOUNT_DECIMAL,
  };
}

/** 草稿时间：当天显示 HH:mm，跨天显示 MM-DD HH:mm。 */
export function formatDraftTimestamp(
  timestamp: number,
  now: number = Date.now(),
): string {
  const date = new Date(timestamp);
  const today = new Date(now);
  const time = `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
  const isSameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (isSameDay) {
    return time;
  }
  return `${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())} ${time}`;
}

/** 草稿类型分类；类型未解析时按支出展示，缺失状态由校验函数负责。 */
export function getDraftItemCategory(
  type: TypeRow | null | undefined,
): RecordTypeCategoryValue {
  return type?.typeCategory ?? RECORD_TYPE_CATEGORY.expense;
}

export function isDraftTypeInBook(
  type: TypeRow | null | undefined,
  booksId: number,
): type is TypeRow {
  return type !== null && type !== undefined && type.booksId === booksId;
}

/** 逐笔类型展示：优先父类型路径，缺失时给出“待选择类型”。 */
export function getDraftItemTypeLabel(
  type: TypeRow | null | undefined,
  typeMap: ReadonlyMap<number, TypeRow>,
): string {
  if (!type) {
    return DRAFT_MISSING_TYPE_TEXT;
  }
  const parent = type.parentId > 0 ? typeMap.get(type.parentId) : undefined;
  return parent ? `${parent.name} / ${type.name}` : type.name;
}

/**
 * 逐笔缺失字段（中文短提示）。
 * 只做 UI 判定与提示；真正写入仍由数据层事务再次校验。
 */
export function getDraftItemMissingLabels(
  item: DraftItem,
  type: TypeRow | null | undefined,
  booksId: number,
): string[] {
  const labels: string[] = [];

  if (!isDraftTypeInBook(type, booksId)) {
    labels.push(
      item.typeId > 0 ? '类型不属于目标账本' : DRAFT_MISSING_TYPE_TEXT,
    );
  }
  if (item.amountCents === null || item.amountCents <= 0) {
    labels.push(DRAFT_MISSING_AMOUNT_TEXT);
  }
  if (type?.typeCategory === RECORD_TYPE_CATEGORY.transfer) {
    if (item.assetId <= 0) {
      labels.push('缺少转出资产');
    }
    if (item.intoAssetId <= 0) {
      labels.push('缺少转入资产');
    } else if (item.assetId > 0 && item.assetId === item.intoAssetId) {
      labels.push('转出与转入资产不能相同');
    }
  }
  if (!isValidRecordTime(item.recordTime)) {
    labels.push('时间不合法');
  }

  return labels;
}

/** 是否满足“确定”直接写入的全部必填条件。 */
export function isDraftItemComplete(
  item: DraftItem,
  type: TypeRow | null | undefined,
  booksId: number,
): boolean {
  return getDraftItemMissingLabels(item, type, booksId).length === 0;
}

export interface BuildDraftConfirmInputParams {
  item: DraftItem;
  type: TypeRow;
  booksId: number;
  imagePaths: readonly string[];
}

/** 把草稿逐笔转换为完整的新增记录入参；不完整时抛出中文错误。 */
export function buildDraftConfirmInput({
  item,
  type,
  booksId,
  imagePaths,
}: BuildDraftConfirmInputParams): CreateRecordInput {
  if (!isDraftTypeInBook(type, booksId)) {
    throw new Error('记账类型不属于目标账本');
  }
  if (item.amountCents === null || item.amountCents <= 0) {
    throw new Error('金额必须大于 0');
  }
  if (!isValidRecordTime(item.recordTime)) {
    throw new Error('记账时间不合法');
  }

  const common = {
    booksId,
    typeId: type.id,
    amount: item.amountCents,
    charge: item.chargeCents,
    remark: item.remark,
    recordTime: item.recordTime,
    tagIds: item.tagIds,
    imagePaths: [...imagePaths],
  };

  if (type.typeCategory === RECORD_TYPE_CATEGORY.transfer) {
    if (item.assetId <= 0) {
      throw new Error('转账必须选择转出资产');
    }
    if (item.intoAssetId <= 0) {
      throw new Error('转账必须选择转入资产');
    }
    if (item.assetId === item.intoAssetId) {
      throw new Error('转账转出与转入资产不能相同');
    }
    return {
      ...common,
      assetId: item.assetId,
      intoAssetId: item.intoAssetId,
    };
  }

  return {
    ...common,
    assetId: item.assetId > 0 ? item.assetId : undefined,
    reimbursable: item.reimbursable
      ? REIMBURSABLE.reimbursable
      : REIMBURSABLE.notReimbursable,
  };
}
