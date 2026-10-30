import dayjs from 'dayjs';
import {
  ASSET_CLASSIFICATION,
  ASSET_TYPE,
  RECORD_TYPE_CATEGORY,
  RECORD_TYPE_SPECIAL_BEHAVIOR,
  REIMBURSABLE,
  VISIBILITY,
  type AssetRow,
  type CreateRecordInput,
  type RecordTypeCategoryValue,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

export const CREATE_RECORD_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const CREATE_RECORD_TIME_PATTERN = /^\d{2}:\d{2}$/;
export const CREATE_RECORD_MAX_AMOUNT_YUAN = 100_000_000;
export const CREATE_RECORD_MAX_REMARK_LENGTH = 200;
export const CREATE_RECORD_MAX_TAG_COUNT = 20;

const CENTS_PER_YUAN = 100;

export interface CreateRecordArgs {
  typeId: number;
  amount: number;
  date?: string;
  time?: string;
  remark?: string;
  tagIds?: number[];
  charge?: number;
  assetId?: number;
  intoAssetId?: number;
  reimbursable?: boolean;
}

export interface RecordMetadata {
  types: readonly TypeRow[];
  tags: readonly TagRow[];
  assets: readonly AssetRow[];
}

export interface ResolvedRecordDraft {
  category: RecordTypeCategoryValue;
  categoryLabel: string;
  typeName: string;
  typePath: string;
  amountCents: number;
  chargeCents: number;
  recordTime: number;
  remark: string;
  tags: readonly TagRow[];
  assetName: string;
  intoAssetName: string;
  isReimbursable: boolean;
  createInput: CreateRecordInput;
}

export type ResolveCreateRecordResult =
  | { ok: true; draft: ResolvedRecordDraft }
  | { ok: false; error: string };

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function parseYuanToCents(
  value: number,
  field: string,
  allowZero: boolean,
): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${field}必须是数字`);
  }
  if (allowZero ? value < 0 : value <= 0) {
    throw new Error(allowZero ? `${field}不能小于 0` : `${field}必须大于 0`);
  }
  if (value > CREATE_RECORD_MAX_AMOUNT_YUAN) {
    throw new Error(`${field}不能超过 ${CREATE_RECORD_MAX_AMOUNT_YUAN} 元`);
  }

  const scaled = value * CENTS_PER_YUAN;
  const cents = Math.round(scaled);
  if (Math.abs(scaled - cents) > 1e-6) {
    throw new Error(`${field}最多支持两位小数`);
  }
  return cents;
}

function parseRecordTime(
  dateValue: string | undefined,
  timeValue: string | undefined,
  now: number,
): number {
  const nowDate = dayjs(now);
  const date = dateValue?.trim() || nowDate.format('YYYY-MM-DD');
  const time = timeValue?.trim() || nowDate.format('HH:mm');

  if (!CREATE_RECORD_DATE_PATTERN.test(date)) {
    throw new Error('日期必须是 YYYY-MM-DD 格式');
  }
  if (!CREATE_RECORD_TIME_PATTERN.test(time)) {
    throw new Error('时间必须是 HH:mm 格式');
  }

  const text = `${date} ${time}`;
  const parsed = dayjs(text);
  if (!parsed.isValid() || parsed.format('YYYY-MM-DD HH:mm') !== text) {
    throw new Error(`日期或时间不合法：${text}`);
  }
  return parsed.valueOf();
}

function normalizeRemark(value: string | undefined): string {
  const remark = value?.trim() ?? '';
  if (remark.length > CREATE_RECORD_MAX_REMARK_LENGTH) {
    throw new Error(`备注不能超过 ${CREATE_RECORD_MAX_REMARK_LENGTH} 字`);
  }
  return remark;
}

function resolveType(
  booksId: number,
  types: readonly TypeRow[],
  typeId: number,
): TypeRow {
  const type = types.find(item => item.id === typeId);
  if (!type || type.booksId !== booksId) {
    throw new Error(`类型 ID ${typeId} 不存在`);
  }
  if (types.some(item => item.parentId === type.id)) {
    throw new Error(`“${type.name}”下还有子类型，请选择具体子类型`);
  }
  return type;
}

function resolveTags(
  booksId: number,
  tags: readonly TagRow[],
  tagIds: readonly number[] | undefined,
): TagRow[] {
  const uniqueIds = Array.from(new Set(tagIds ?? []));
  if (uniqueIds.length > CREATE_RECORD_MAX_TAG_COUNT) {
    throw new Error(`最多只能选择 ${CREATE_RECORD_MAX_TAG_COUNT} 个标签`);
  }

  return uniqueIds.map(tagId => {
    const tag = tags.find(item => item.id === tagId);
    if (!tag || tag.booksId !== booksId) {
      throw new Error(`标签 ID ${tagId} 不存在`);
    }
    if (tag.invisible === VISIBILITY.hidden) {
      throw new Error(`标签“${tag.name}”已隐藏，不能使用`);
    }
    return tag;
  });
}

function resolveAsset(
  booksId: number,
  assets: readonly AssetRow[],
  assetId: number | undefined,
): AssetRow | undefined {
  if (assetId === undefined || assetId === 0) {
    return undefined;
  }
  const asset = assets.find(item => item.id === assetId);
  if (!asset || asset.booksId !== booksId) {
    throw new Error(`资产 ID ${assetId} 不存在`);
  }
  if (asset.invisible === VISIBILITY.hidden) {
    throw new Error(`资产“${asset.name}”已隐藏，不能使用`);
  }
  return asset;
}

function assertTransferAssetRules(
  type: TypeRow,
  fromAsset: AssetRow,
  intoAsset: AssetRow,
): void {
  switch (type.specialBehavior) {
    case RECORD_TYPE_SPECIAL_BEHAVIOR.creditCardPayment:
      if (intoAsset.type !== ASSET_TYPE.creditCard) {
        throw new Error('还信用卡要求转入资产是信用卡');
      }
      return;
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtBorrow:
      if (
        fromAsset.type !== ASSET_TYPE.debt ||
        fromAsset.classification !== ASSET_CLASSIFICATION.borrow
      ) {
        throw new Error('债务借入要求转出资产是借入类债务');
      }
      return;
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtLend:
      if (
        intoAsset.type !== ASSET_TYPE.debt ||
        intoAsset.classification !== ASSET_CLASSIFICATION.lend
      ) {
        throw new Error('债权借出要求转入资产是借出类债权');
      }
      return;
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtRepayment:
      if (
        intoAsset.type !== ASSET_TYPE.debt ||
        intoAsset.classification !== ASSET_CLASSIFICATION.borrow
      ) {
        throw new Error('债务还款要求转入资产是借入类债务');
      }
      return;
    case RECORD_TYPE_SPECIAL_BEHAVIOR.debtProceeds:
      if (
        fromAsset.type !== ASSET_TYPE.debt ||
        fromAsset.classification !== ASSET_CLASSIFICATION.lend
      ) {
        throw new Error('债权收款要求转出资产是借出类债权');
      }
      return;
    case RECORD_TYPE_SPECIAL_BEHAVIOR.none:
      return;
    default:
      throw new Error(`暂不支持的转账类型：${type.name}`);
  }
}

function buildTypePath(type: TypeRow, types: readonly TypeRow[]): string {
  if (type.parentId === 0) {
    return type.name;
  }
  const parent = types.find(item => item.id === type.parentId);
  return parent ? `${parent.name} / ${type.name}` : type.name;
}

function createResolvedDraft(
  type: TypeRow,
  metadata: RecordMetadata,
  values: {
    amountCents: number;
    chargeCents: number;
    recordTime: number;
    remark: string;
    tags: readonly TagRow[];
    assetName: string;
    intoAssetName: string;
    isReimbursable: boolean;
    createInput: CreateRecordInput;
  },
): ResolveCreateRecordResult {
  return {
    ok: true,
    draft: {
      category: type.typeCategory,
      categoryLabel: RECORD_TYPE_CATEGORY.label(type.typeCategory),
      typeName: type.name,
      typePath: buildTypePath(type, metadata.types),
      ...values,
    },
  };
}

function isAbsorptionBehavior(specialBehavior: string): boolean {
  return (
    specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption ||
    specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption
  );
}

export function resolveCreateRecordInput(
  booksId: number,
  input: CreateRecordArgs,
  metadata: RecordMetadata,
  now = Date.now(),
): ResolveCreateRecordResult {
  try {
    const type = resolveType(booksId, metadata.types, input.typeId);
    const amountCents = parseYuanToCents(input.amount, '金额', false);
    const chargeCents =
      input.charge === undefined
        ? 0
        : parseYuanToCents(input.charge, '手续费', true);
    const recordTime = parseRecordTime(input.date, input.time, now);
    const remark = normalizeRemark(input.remark);
    const tags = resolveTags(booksId, metadata.tags, input.tagIds);
    const baseInput = {
      typeId: type.id,
      booksId,
      amount: amountCents,
      charge: chargeCents,
      remark,
      recordTime,
      tagIds: tags.map(tag => tag.id),
    };

    if (type.typeCategory === RECORD_TYPE_CATEGORY.expense) {
      if (type.specialBehavior !== RECORD_TYPE_SPECIAL_BEHAVIOR.none) {
        throw new Error(`暂不支持的支出类型：${type.name}`);
      }
      if (input.intoAssetId !== undefined) {
        throw new Error('支出记录不需要转入资产');
      }
      const asset = resolveAsset(booksId, metadata.assets, input.assetId);
      return createResolvedDraft(type, metadata, {
        amountCents,
        chargeCents,
        recordTime,
        remark,
        tags,
        assetName: asset?.name ?? '',
        intoAssetName: '',
        isReimbursable: input.reimbursable === true,
        createInput: {
          ...baseInput,
          assetId: asset?.id ?? 0,
          reimbursable: input.reimbursable
            ? REIMBURSABLE.reimbursable
            : REIMBURSABLE.notReimbursable,
        },
      });
    }

    if (type.typeCategory === RECORD_TYPE_CATEGORY.income) {
      if (isAbsorptionBehavior(type.specialBehavior)) {
        throw new Error(
          '退款/报销类型需要关联原支出，暂不支持在助手中创建，请在 App 内记账',
        );
      }
      if (type.specialBehavior !== RECORD_TYPE_SPECIAL_BEHAVIOR.none) {
        throw new Error(`暂不支持的收入类型：${type.name}`);
      }
      if (input.intoAssetId !== undefined) {
        throw new Error('收入记录不需要转入资产');
      }
      if (chargeCents > amountCents) {
        throw new Error('手续费不能大于收入金额');
      }
      const asset = resolveAsset(booksId, metadata.assets, input.assetId);
      return createResolvedDraft(type, metadata, {
        amountCents,
        chargeCents,
        recordTime,
        remark,
        tags,
        assetName: asset?.name ?? '',
        intoAssetName: '',
        isReimbursable: false,
        createInput: {
          ...baseInput,
          assetId: asset?.id ?? 0,
          reimbursable: REIMBURSABLE.notReimbursable,
        },
      });
    }

    if (type.typeCategory === RECORD_TYPE_CATEGORY.transfer) {
      const fromAsset = resolveAsset(booksId, metadata.assets, input.assetId);
      const intoAsset = resolveAsset(
        booksId,
        metadata.assets,
        input.intoAssetId,
      );
      if (!fromAsset) {
        throw new Error('转账必须指定转出资产');
      }
      if (!intoAsset) {
        throw new Error('转账必须指定转入资产');
      }
      if (fromAsset.id === intoAsset.id) {
        throw new Error('转出资产和转入资产不能相同');
      }
      assertTransferAssetRules(type, fromAsset, intoAsset);
      return createResolvedDraft(type, metadata, {
        amountCents,
        chargeCents,
        recordTime,
        remark,
        tags,
        assetName: fromAsset.name,
        intoAssetName: intoAsset.name,
        isReimbursable: false,
        createInput: {
          ...baseInput,
          assetId: fromAsset.id,
          intoAssetId: intoAsset.id,
          reimbursable: REIMBURSABLE.notReimbursable,
        },
      });
    }

    throw new Error(`未知的记录分类：${type.typeCategory}`);
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) };
  }
}
