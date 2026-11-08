import {
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type Api,
  type ConfirmQuickBookDraftItemResult,
  type CreateRecordInput,
  type DraftItem,
  type TypeRow,
} from '@pennyspring/api';

import type { MediaStore } from '../../media';
import {
  type QuickBookDraftRecord,
  quickBookDraftCache,
} from './draftCacheStorage';
import {
  isRemoteDraftBook,
  isSameDraftBook,
  type DraftBookTarget,
} from './draftBook';

export interface ConfirmQuickBookDraftItemOptions {
  draftId: string;
  itemIndex: number;
  target: DraftBookTarget;
  bookApi: Api;
  media: MediaStore | null;
  input?: CreateRecordInput;
  attemptId?: string;
}

function createAttemptId(draftId: string, itemIndex: number): string {
  return `${draftId}:${itemIndex}:${Date.now()}:${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function imageFileName(imagePath: string): string {
  const name = imagePath.split('/').pop();
  return name === undefined || name === '' ? 'draft.jpg' : name;
}

function getTypeRow(
  types: readonly TypeRow[],
  typeId: number,
  booksId: number,
): TypeRow {
  if (!Number.isInteger(typeId) || typeId <= 0) {
    throw new Error('请选择记账类型');
  }
  const typeRow = types.find(type => type.id === typeId);
  if (typeRow === undefined) {
    throw new Error(`记账类型不存在: ${typeId}`);
  }
  if (typeRow.booksId !== booksId) {
    throw new Error('记账类型不属于目标账本');
  }
  return typeRow;
}

function buildConfirmRecordInput(
  draft: QuickBookDraftRecord,
  item: DraftItem,
  typeRow: TypeRow,
  imagePaths: string[],
  input: CreateRecordInput | undefined,
): CreateRecordInput {
  const booksId = draft.target.booksId;
  const typeId = input?.typeId ?? item.typeId;
  if (typeId !== typeRow.id) {
    throw new Error('记账类型与确认内容不一致');
  }

  const amount = input?.amount ?? item.amountCents;
  if (
    amount === null ||
    amount === undefined ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error('金额必须大于 0');
  }

  const charge = input?.charge ?? item.chargeCents;
  if (!Number.isInteger(charge) || charge < 0) {
    throw new Error('手续费不能小于 0');
  }

  const recordTime = input?.recordTime ?? item.recordTime;
  if (!Number.isInteger(recordTime) || recordTime <= 0) {
    throw new Error('记账时间不合法');
  }

  const common = {
    booksId,
    amount,
    charge,
    remark: input?.remark ?? item.remark,
    recordTime,
    tagIds: input?.tagIds ?? item.tagIds,
    imagePaths,
    relatedRecordIds: input?.relatedRecordIds,
  };

  if (typeRow.typeCategory === RECORD_TYPE_CATEGORY.transfer) {
    const assetId = input?.assetId ?? item.assetId;
    const intoAssetId = input?.intoAssetId ?? item.intoAssetId;
    if (!Number.isInteger(assetId) || assetId <= 0) {
      throw new Error('转账必须选择转出资产');
    }
    if (!Number.isInteger(intoAssetId) || intoAssetId <= 0) {
      throw new Error('转账必须选择转入资产');
    }
    if (assetId === intoAssetId) {
      throw new Error('转账转出与转入资产不能相同');
    }
    return { ...common, typeId, assetId, intoAssetId };
  }

  const assetId = input?.assetId ?? item.assetId;
  const reimbursable =
    input && 'reimbursable' in input
      ? input.reimbursable
      : item.reimbursable
        ? REIMBURSABLE.reimbursable
        : REIMBURSABLE.notReimbursable;
  if (
    reimbursable !== REIMBURSABLE.reimbursable &&
    reimbursable !== REIMBURSABLE.notReimbursable
  ) {
    throw new Error('报销状态不合法');
  }
  return {
    ...common,
    typeId,
    assetId: assetId > 0 ? assetId : undefined,
    reimbursable,
  };
}

async function resolveImagePaths(
  draft: QuickBookDraftRecord,
  media: MediaStore | null,
  input: CreateRecordInput | undefined,
): Promise<string[]> {
  if (input?.imagePaths !== undefined) {
    return input.imagePaths;
  }
  if (!draft.attachImage || draft.imagePath === '') {
    return [];
  }
  if (draft.attachmentRef !== '') {
    return [draft.attachmentRef];
  }
  if (media === null) {
    return [draft.imagePath];
  }
  const ref = await media.save({
    uri: draft.imagePath,
    fileName: imageFileName(draft.imagePath),
    mimeType: 'image/jpeg',
  });
  await quickBookDraftCache.setAttachmentRef(draft.id, ref);
  return [ref];
}

export async function confirmQuickBookDraftItem(
  options: ConfirmQuickBookDraftItemOptions,
): Promise<ConfirmQuickBookDraftItemResult> {
  const draft = await quickBookDraftCache.getById(options.draftId);
  if (!isSameDraftBook(draft.target, options.target)) {
    throw new Error('草稿不属于当前账本');
  }
  if (draft.status !== 'pending') {
    throw new Error(`草稿状态不允许确认: ${draft.status}`);
  }
  const item = draft.items[options.itemIndex];
  if (item === undefined) {
    throw new Error(`草稿笔数不存在: ${options.itemIndex}`);
  }
  if (item.status === 'confirmed') {
    return { item, recordId: item.recordId };
  }

  const types = await options.bookApi.type.getAll(draft.target.booksId);
  const typeId = options.input?.typeId ?? item.typeId;
  const typeRow = getTypeRow(types, typeId, draft.target.booksId);
  const imagePaths = await resolveImagePaths(
    draft,
    options.media,
    options.input,
  );
  const recordInput = buildConfirmRecordInput(
    draft,
    item,
    typeRow,
    imagePaths,
    options.input,
  );

  const attemptId =
    item.confirmAttemptId ??
    options.attemptId ??
    createAttemptId(draft.id, options.itemIndex);
  await quickBookDraftCache.setConfirmAttempt(
    draft.id,
    options.itemIndex,
    attemptId,
  );

  let recordId: number;
  try {
    const record = await options.bookApi.record.create({
      ...recordInput,
      clientMutationId: attemptId,
    });
    recordId = record.id;
  } catch (error) {
    if (!isRemoteDraftBook(draft.target)) {
      await quickBookDraftCache
        .clearConfirmAttempt(draft.id, options.itemIndex)
        .catch(() => undefined);
    }
    throw error;
  }

  await quickBookDraftCache.markItemConfirmed(
    draft.id,
    options.itemIndex,
    recordId,
  );
  return { item: { ...item, status: 'confirmed', recordId }, recordId };
}
