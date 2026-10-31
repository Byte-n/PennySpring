import dayjs from 'dayjs';
import {
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type RecordRow,
  type TypeRow,
  type UpdateRecordInput,
} from '@pennyspring/api';

import {
  buildTypePath,
  isAbsorptionBehavior,
  resolveCreateRecordInput,
  type CreateRecordArgs,
  type RecordMetadata,
  type ResolvedRecordDraft,
} from './recordDraft';

const CENTS_PER_YUAN = 100;
const EMPTY_REMARK_TEXT = '（空）';
const EMPTY_TAGS_TEXT = '无';
const EMPTY_ASSET_TEXT = '未选择';

export interface UpdateRecordArgs {
  recordId: number;
  typeId?: number;
  amount?: number;
  date?: string;
  time?: string;
  remark?: string;
  tagIds?: number[];
  charge?: number;
  assetId?: number;
  intoAssetId?: number;
  reimbursable?: boolean;
}

export interface UpdateRecordContext {
  record: RecordRow;
  tagIds: readonly number[];
  imagePaths: readonly string[];
  /** 本次追加的图片，追加在原有图片之后。 */
  addedImagePaths?: readonly string[];
}

export type RecordFieldKey =
  | 'category'
  | 'amount'
  | 'recordTime'
  | 'charge'
  | 'remark'
  | 'tags'
  | 'asset'
  | 'reimbursable'
  | 'images';

export interface RecordFieldSummary {
  category: string;
  amount: string;
  recordTime: string;
  charge: string;
  remark: string;
  tags: string;
  asset: string;
  reimbursable: string;
  images: string;
}

export interface RecordChange {
  field: RecordFieldKey;
  label: string;
  before: string;
  after: string;
}

export type ResolveUpdateRecordResult =
  | {
      ok: true;
      draft: ResolvedRecordDraft;
      updateInput: UpdateRecordInput;
      changes: RecordChange[];
    }
  | { ok: false; error: string };

const FIELD_LABELS: Record<RecordFieldKey, string> = {
  category: '分类',
  amount: '金额',
  recordTime: '时间',
  charge: '手续费',
  remark: '备注',
  tags: '标签',
  asset: '资产',
  reimbursable: '可报销',
  images: '图片',
};

const FIELD_ORDER: readonly RecordFieldKey[] = [
  'category',
  'amount',
  'recordTime',
  'charge',
  'remark',
  'tags',
  'asset',
  'reimbursable',
  'images',
];

function formatYuan(cents: number): string {
  return `¥${(cents / CENTS_PER_YUAN).toFixed(2)}`;
}

function formatRecordTime(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
}

function formatNames(names: readonly string[], emptyText: string): string {
  return names.length > 0 ? names.join('、') : emptyText;
}

function describeCategory(type: TypeRow, types: readonly TypeRow[]): string {
  return `${RECORD_TYPE_CATEGORY.label(type.typeCategory)} · ${buildTypePath(
    type,
    types,
  )}`;
}

function describeAsset(
  isTransfer: boolean,
  assetName: string,
  intoAssetName: string,
): string {
  if (isTransfer) {
    return `${assetName || EMPTY_ASSET_TEXT} → ${
      intoAssetName || EMPTY_ASSET_TEXT
    }`;
  }
  return assetName || EMPTY_ASSET_TEXT;
}

export function summarizeRecord(
  context: UpdateRecordContext,
  metadata: RecordMetadata,
): RecordFieldSummary | null {
  const type = metadata.types.find(item => item.id === context.record.typeId);
  if (!type) {
    return null;
  }

  const tagNames = Array.from(
    new Set(
      context.tagIds
        .map(tagId => metadata.tags.find(tag => tag.id === tagId)?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  );
  const assetName =
    metadata.assets.find(asset => asset.id === context.record.assetId)?.name ??
    '';
  const intoAssetName =
    metadata.assets.find(asset => asset.id === context.record.intoAssetId)
      ?.name ?? '';

  return {
    category: describeCategory(type, metadata.types),
    amount: formatYuan(context.record.amount),
    recordTime: formatRecordTime(context.record.recordTime),
    charge: formatYuan(context.record.charge),
    remark: context.record.remark || EMPTY_REMARK_TEXT,
    tags: formatNames(tagNames, EMPTY_TAGS_TEXT),
    asset: describeAsset(
      type.typeCategory === RECORD_TYPE_CATEGORY.transfer,
      assetName,
      intoAssetName,
    ),
    reimbursable:
      context.record.reimbursable === REIMBURSABLE.reimbursable ? '是' : '否',
    images: `${context.imagePaths.length} 张`,
  };
}

export function summarizeDraft(
  draft: ResolvedRecordDraft,
  imageCount: number,
): RecordFieldSummary {
  return {
    category: `${draft.categoryLabel} · ${draft.typePath}`,
    amount: formatYuan(draft.amountCents),
    recordTime: formatRecordTime(draft.recordTime),
    charge: formatYuan(draft.chargeCents),
    remark: draft.remark || EMPTY_REMARK_TEXT,
    tags: formatNames(
      draft.tags.map(tag => tag.name),
      EMPTY_TAGS_TEXT,
    ),
    asset: describeAsset(
      draft.category === RECORD_TYPE_CATEGORY.transfer,
      draft.assetName,
      draft.intoAssetName,
    ),
    reimbursable: draft.isReimbursable ? '是' : '否',
    images: `${imageCount} 张`,
  };
}

export function diffRecordSummaries(
  before: RecordFieldSummary,
  after: RecordFieldSummary,
): RecordChange[] {
  return FIELD_ORDER.flatMap(field => {
    if (before[field] === after[field]) {
      return [];
    }
    return [
      {
        field,
        label: FIELD_LABELS[field],
        before: before[field],
        after: after[field],
      },
    ];
  });
}

function mergeImagePaths(
  existing: readonly string[],
  added: readonly string[],
): string[] {
  return Array.from(
    new Set(
      [...existing, ...added].filter(imagePath => imagePath.trim() !== ''),
    ),
  );
}

function mergeOptionalId(
  providedId: number | undefined,
  fallbackId: number,
): number | undefined {
  const value = providedId ?? fallbackId;
  return value > 0 ? value : undefined;
}

export function resolveUpdateRecordInput(
  booksId: number,
  context: UpdateRecordContext,
  input: UpdateRecordArgs,
  metadata: RecordMetadata,
  now = Date.now(),
): ResolveUpdateRecordResult {
  try {
    const { record } = context;
    if (record.booksId !== booksId) {
      throw new Error(`记录 ${record.id} 不属于当前账本`);
    }

    const currentType = metadata.types.find(item => item.id === record.typeId);
    if (!currentType) {
      throw new Error('原记录的类型不存在');
    }
    if (isAbsorptionBehavior(currentType.specialBehavior)) {
      throw new Error('退款/报销记录暂不支持在助手中修改，请在 App 内操作');
    }

    const targetTypeId = input.typeId ?? record.typeId;
    const targetType = metadata.types.find(item => item.id === targetTypeId);
    const recordDate = dayjs(record.recordTime);
    const createArgs: CreateRecordArgs = {
      typeId: targetTypeId,
      amount: input.amount ?? record.amount / CENTS_PER_YUAN,
      date: input.date ?? recordDate.format('YYYY-MM-DD'),
      time: input.time ?? recordDate.format('HH:mm'),
      remark: input.remark ?? record.remark,
      tagIds: input.tagIds !== undefined ? [...input.tagIds] : [...context.tagIds],
      charge: input.charge ?? record.charge / CENTS_PER_YUAN,
      assetId: mergeOptionalId(input.assetId, record.assetId),
      reimbursable:
        input.reimbursable ??
        record.reimbursable === REIMBURSABLE.reimbursable,
    };

    if (targetType?.typeCategory === RECORD_TYPE_CATEGORY.transfer) {
      createArgs.intoAssetId = mergeOptionalId(
        input.intoAssetId,
        record.intoAssetId,
      );
    } else if (input.intoAssetId !== undefined) {
      createArgs.intoAssetId = input.intoAssetId;
    }

    const resolved = resolveCreateRecordInput(
      booksId,
      createArgs,
      metadata,
      now,
      {
        allowHiddenTags: input.tagIds === undefined,
        allowHiddenAssets:
          input.assetId === undefined && input.intoAssetId === undefined,
      },
    );
    if (!resolved.ok) {
      return resolved;
    }

    const imagePaths = mergeImagePaths(
      context.imagePaths,
      context.addedImagePaths ?? [],
    );
    const before = summarizeRecord(context, metadata);
    if (before === null) {
      throw new Error('原记录的类型不存在');
    }
    const after = summarizeDraft(resolved.draft, imagePaths.length);

    return {
      ok: true,
      draft: resolved.draft,
      updateInput: {
        ...resolved.draft.createInput,
        id: record.id,
        imagePaths,
      } as UpdateRecordInput,
      changes: diffRecordSummaries(before, after),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
