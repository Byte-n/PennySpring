import { and, count, desc, eq, inArray, lt } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

import {
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  RECORD_TYPE_CATEGORY,
  REIMBURSABLE,
  type QuickBookDraftSourceValue,
  type QuickBookDraftStatusValue,
} from '../constants';
import { books, quickBookDrafts, types } from '../schema';
import type { Database } from '../types';
import { createRecordInTransaction } from './record-service';
import type {
  ConfirmQuickBookDraftItemResult,
  CreateQuickBookDraftPlaceholderInput,
  CreateRecordInput,
  DraftItem,
  DraftItemStatus,
  QuickBookDraftListFilter,
  QuickBookDraftPreset,
  QuickBookDraftRow,
  QuickBookDraftUpdateMeta,
  Tx,
  TypeRow,
} from './types';

export type {
  ConfirmQuickBookDraftItemResult,
  CreateQuickBookDraftPlaceholderInput,
  DraftItem,
  DraftItemStatus,
  QuickBookDraftListFilter,
  QuickBookDraftPreset,
  QuickBookDraftRow,
  QuickBookDraftUpdateMeta,
} from './types';

/** generating 超过该时长未更新，启动清理时标记为 failed。 */
const GENERATING_TIMEOUT_MS = 5 * 60 * 1000;
/** discarded 行保留时长。 */
const DISCARDED_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
/** confirmed 行保留时长。 */
const CONFIRMED_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const GENERATING_TIMEOUT_ERROR = '生成超时，请重试';

const DEFAULT_LIST_STATUSES: QuickBookDraftStatusValue[] = [
  QUICK_BOOK_DRAFT_STATUS.generating,
  QUICK_BOOK_DRAFT_STATUS.pending,
  QUICK_BOOK_DRAFT_STATUS.failed,
];

type QuickBookDraftDbRow = InferSelectModel<typeof quickBookDrafts>;
type DraftItemMode = 'input' | 'stored';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(raw: string, message: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(message);
  }
}

function assertDraftStatus(status: string): void {
  if (
    !QUICK_BOOK_DRAFT_STATUS.values().includes(
      status as QuickBookDraftStatusValue,
    )
  ) {
    throw new Error(`草稿状态非法: ${status}`);
  }
}

function assertDraftSource(source: string): void {
  if (
    !QUICK_BOOK_DRAFT_SOURCE.values().includes(
      source as QuickBookDraftSourceValue,
    )
  ) {
    throw new Error(`草稿来源非法: ${source}`);
  }
}

function readNonNegativeInteger(
  value: unknown,
  label: string,
  fallback: number,
): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label}不合法`);
  }
  return value;
}

function readPositiveInteger(
  value: unknown,
  label: string,
  fallback: number,
): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${label}不合法`);
  }
  return value;
}

function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function readAmountCents(value: unknown, label: string): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label}不合法`);
  }
  return value;
}

function readTagIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value.filter(
        (tagId): tagId is number =>
          typeof tagId === 'number' && Number.isInteger(tagId) && tagId > 0,
      ),
    ),
  );
}

function readWarnings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (warning): warning is string => typeof warning === 'string',
  );
}

function readItemStatus(value: unknown, index: number): DraftItemStatus {
  if (value === undefined || value === 'pending') return 'pending';
  if (value === 'confirmed') return 'confirmed';
  throw new Error(`草稿第 ${index + 1} 笔状态非法`);
}

function normalizeDraftItem(
  raw: unknown,
  index: number,
  mode: DraftItemMode,
  now: number,
): DraftItem {
  if (!isRecord(raw)) {
    throw new Error(`草稿第 ${index + 1} 笔格式不正确`);
  }
  const label = `草稿第 ${index + 1} 笔`;
  const storedStatus = readItemStatus(raw.status, index);
  return {
    status: mode === 'input' ? 'pending' : storedStatus,
    recordId:
      mode === 'input'
        ? 0
        : readNonNegativeInteger(raw.recordId, `${label}记录 id`, 0),
    typeId: readNonNegativeInteger(raw.typeId, `${label}类型 id`, 0),
    typeName: readString(raw.typeName, ''),
    amountCents: readAmountCents(raw.amountCents, `${label}金额`),
    recordTime: readPositiveInteger(raw.recordTime, `${label}记账时间`, now),
    remark: readString(raw.remark, ''),
    assetId: readNonNegativeInteger(raw.assetId, `${label}资产 id`, 0),
    assetName: readString(raw.assetName, ''),
    intoAssetId: readNonNegativeInteger(
      raw.intoAssetId,
      `${label}转入资产 id`,
      0,
    ),
    intoAssetName: readString(raw.intoAssetName, ''),
    chargeCents: readNonNegativeInteger(raw.chargeCents, `${label}手续费`, 0),
    tagIds: readTagIds(raw.tagIds),
    reimbursable: raw.reimbursable === true,
    warnings: readWarnings(raw.warnings),
  };
}

function normalizeDraftItems(
  raw: unknown,
  mode: DraftItemMode,
  now: number,
): DraftItem[] {
  if (!Array.isArray(raw)) {
    throw new Error('草稿内容格式不正确');
  }
  return raw.map((item, index) => normalizeDraftItem(item, index, mode, now));
}

function parseDraftItems(raw: string, now: number): DraftItem[] {
  if (raw.trim() === '') return [];
  return normalizeDraftItems(
    parseJson(raw, '草稿内容格式不正确'),
    'stored',
    now,
  );
}

function parsePreset(raw: string): QuickBookDraftPreset {
  if (raw.trim() === '') return { assetId: 0, typeId: 0 };
  const parsed = parseJson(raw, '草稿预设格式不正确');
  if (!isRecord(parsed)) throw new Error('草稿预设格式不正确');
  return {
    assetId: readNonNegativeInteger(parsed.assetId, '草稿预设资产 id', 0),
    typeId: readNonNegativeInteger(parsed.typeId, '草稿预设类型 id', 0),
  };
}

function parseRecordIds(raw: string): number[] {
  if (raw.trim() === '') return [];
  const parsed = parseJson(raw, '草稿记录 id 格式不正确');
  if (!Array.isArray(parsed)) throw new Error('草稿记录 id 格式不正确');
  return Array.from(
    new Set(
      parsed.filter(
        (recordId): recordId is number =>
          typeof recordId === 'number' &&
          Number.isInteger(recordId) &&
          recordId > 0,
      ),
    ),
  );
}

function toDraftRow(row: QuickBookDraftDbRow): QuickBookDraftRow {
  assertDraftStatus(row.status);
  assertDraftSource(row.source);
  const now = Date.now();
  return {
    id: row.id,
    booksId: row.booksId,
    status: row.status,
    source: row.source,
    imagePath: row.imagePath,
    items: parseDraftItems(row.payload, now),
    preset: parsePreset(row.preset),
    agentProviderId: row.agentProviderId,
    agentModelId: row.agentModelId,
    agentSummary: row.agentSummary,
    errorText: row.errorText,
    confirmedCount: row.confirmedCount,
    recordIds: parseRecordIds(row.recordIds),
    createdTime: row.createdTime,
    updatedTime: row.updatedTime,
    confirmedAt: row.confirmedAt,
  };
}

async function getDraftRow(
  db: Database | Tx,
  id: string,
): Promise<QuickBookDraftDbRow> {
  const row = await db
    .select()
    .from(quickBookDrafts)
    .where(eq(quickBookDrafts.id, id))
    .get();
  if (!row) throw new Error(`草稿不存在: ${id}`);
  return row;
}

function getItemAtIndex(
  items: readonly DraftItem[],
  itemIndex: number,
): DraftItem {
  if (
    !Number.isInteger(itemIndex) ||
    itemIndex < 0 ||
    itemIndex >= items.length
  ) {
    throw new Error(`草稿笔数不存在: ${itemIndex}`);
  }
  const item = items[itemIndex];
  if (!item) throw new Error(`草稿笔数不存在: ${itemIndex}`);
  return item;
}

function normalizePreset(
  input: Partial<QuickBookDraftPreset> | undefined,
): QuickBookDraftPreset {
  return {
    assetId: readNonNegativeInteger(input?.assetId, '草稿预设资产 id', 0),
    typeId: readNonNegativeInteger(input?.typeId, '草稿预设类型 id', 0),
  };
}

function normalizeUpdateMeta(
  meta: QuickBookDraftUpdateMeta | undefined,
): QuickBookDraftUpdateMeta {
  const normalized: QuickBookDraftUpdateMeta = {};
  if (meta?.agentSummary !== undefined) {
    if (typeof meta.agentSummary !== 'string') {
      throw new Error('草稿摘要不合法');
    }
    normalized.agentSummary = meta.agentSummary;
  }
  if (meta?.agentProviderId !== undefined) {
    normalized.agentProviderId = readNonNegativeInteger(
      meta.agentProviderId,
      '草稿提供商 id',
      0,
    );
  }
  if (meta?.agentModelId !== undefined) {
    if (typeof meta.agentModelId !== 'string') {
      throw new Error('草稿模型 id 不合法');
    }
    normalized.agentModelId = meta.agentModelId;
  }
  return normalized;
}

function normalizePlaceholderInput(
  input: CreateQuickBookDraftPlaceholderInput,
) {
  const id = typeof input.id === 'string' ? input.id.trim() : '';
  if (!id) throw new Error('草稿 id 不能为空');
  if (!Number.isInteger(input.booksId) || input.booksId <= 0) {
    throw new Error(`账本 id 不合法: ${input.booksId}`);
  }
  if (typeof input.imagePath !== 'string' || !input.imagePath.trim()) {
    throw new Error('草稿图片路径不能为空');
  }
  const source = input.source ?? QUICK_BOOK_DRAFT_SOURCE.floatingCapture;
  assertDraftSource(source);
  const agentProviderId = readNonNegativeInteger(
    input.agentProviderId,
    '草稿提供商 id',
    0,
  );
  return {
    id,
    booksId: input.booksId,
    imagePath: input.imagePath,
    source,
    preset: normalizePreset(input.preset),
    agentProviderId,
    agentModelId: readString(input.agentModelId, ''),
  };
}

/**
 * 新建（或按同一 id 重置）生成中占位草稿。
 * 同一 id 已确认时拒绝，避免覆盖已记账草稿。
 */
export function createQuickBookDraftPlaceholder(
  db: Database,
  input: CreateQuickBookDraftPlaceholderInput,
): Promise<QuickBookDraftRow> {
  const normalized = normalizePlaceholderInput(input);
  return db.transaction(async tx => {
    const book = await tx
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, normalized.booksId))
      .get();
    if (!book) throw new Error(`账本不存在: ${normalized.booksId}`);

    const existing = await tx
      .select()
      .from(quickBookDrafts)
      .where(eq(quickBookDrafts.id, normalized.id))
      .get();
    const now = Date.now();
    if (existing) {
      if (existing.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
        throw new Error('草稿已完成确认，无法重新生成');
      }
      await tx
        .update(quickBookDrafts)
        .set({
          booksId: normalized.booksId,
          status: QUICK_BOOK_DRAFT_STATUS.generating,
          source: normalized.source,
          imagePath: normalized.imagePath,
          payload: '[]',
          preset: JSON.stringify(normalized.preset),
          agentProviderId: normalized.agentProviderId,
          agentModelId: normalized.agentModelId,
          agentSummary: '',
          errorText: '',
          confirmedCount: 0,
          recordIds: '[]',
          confirmedAt: 0,
          updatedTime: now,
        })
        .where(eq(quickBookDrafts.id, normalized.id));
    } else {
      await tx.insert(quickBookDrafts).values({
        id: normalized.id,
        booksId: normalized.booksId,
        status: QUICK_BOOK_DRAFT_STATUS.generating,
        source: normalized.source,
        imagePath: normalized.imagePath,
        payload: '[]',
        preset: JSON.stringify(normalized.preset),
        agentProviderId: normalized.agentProviderId,
        agentModelId: normalized.agentModelId,
        agentSummary: '',
        errorText: '',
        confirmedCount: 0,
        recordIds: '[]',
        createdTime: now,
        updatedTime: now,
        confirmedAt: 0,
      });
    }

    return toDraftRow(await getDraftRow(tx, normalized.id));
  });
}

export async function getQuickBookDraftById(
  db: Database,
  id: string,
): Promise<QuickBookDraftRow> {
  return toDraftRow(await getDraftRow(db, id));
}

export async function listQuickBookDrafts(
  db: Database,
  filter: QuickBookDraftListFilter = {},
): Promise<QuickBookDraftRow[]> {
  const statuses = filter.statuses ?? DEFAULT_LIST_STATUSES;
  for (const status of statuses) {
    assertDraftStatus(status);
  }
  if (statuses.length === 0) return [];

  const conditions = [inArray(quickBookDrafts.status, statuses)];
  if (filter.booksId !== undefined) {
    if (!Number.isInteger(filter.booksId) || filter.booksId <= 0) {
      throw new Error(`账本 id 不合法: ${filter.booksId}`);
    }
    conditions.push(eq(quickBookDrafts.booksId, filter.booksId));
  }

  const rows = await db
    .select()
    .from(quickBookDrafts)
    .where(and(...conditions))
    .orderBy(
      desc(quickBookDrafts.updatedTime),
      desc(quickBookDrafts.createdTime),
      desc(quickBookDrafts.id),
    )
    .all();

  return rows.map(toDraftRow);
}

export async function countPendingQuickBookDrafts(
  db: Database,
): Promise<number> {
  const result = await db
    .select({ value: count() })
    .from(quickBookDrafts)
    .where(
      inArray(quickBookDrafts.status, [
        QUICK_BOOK_DRAFT_STATUS.pending,
        QUICK_BOOK_DRAFT_STATUS.failed,
      ]),
    )
    .get();
  return Number(result?.value ?? 0);
}

/**
 * 覆盖草稿逐笔内容与预设，并把组状态置为 pending。
 * 已有笔写入记录时拒绝覆盖，避免丢失 recordId 造成重复记账。
 */
export function updateQuickBookDraftItems(
  db: Database,
  id: string,
  items: readonly DraftItem[],
  preset: QuickBookDraftPreset,
  meta?: QuickBookDraftUpdateMeta,
): Promise<QuickBookDraftRow> {
  return db.transaction(async tx => {
    const row = await getDraftRow(tx, id);
    if (
      row.status === QUICK_BOOK_DRAFT_STATUS.confirmed ||
      row.status === QUICK_BOOK_DRAFT_STATUS.discarded
    ) {
      throw new Error(`草稿状态不允许写入: ${row.status}`);
    }
    const now = Date.now();
    const currentItems = parseDraftItems(row.payload, now);
    if (
      currentItems.some(item => item.status === 'confirmed') ||
      row.confirmedCount > 0
    ) {
      throw new Error('草稿已有确认的记录，无法覆盖');
    }
    const nextItems = normalizeDraftItems(items, 'input', now);
    await tx
      .update(quickBookDrafts)
      .set({
        status: QUICK_BOOK_DRAFT_STATUS.pending,
        payload: JSON.stringify(nextItems),
        preset: JSON.stringify(normalizePreset(preset)),
        ...normalizeUpdateMeta(meta),
        errorText: '',
        confirmedCount: 0,
        recordIds: '[]',
        confirmedAt: 0,
        updatedTime: now,
      })
      .where(eq(quickBookDrafts.id, id));
    return toDraftRow(await getDraftRow(tx, id));
  });
}

export function markQuickBookDraftFailed(
  db: Database,
  id: string,
  errorText: string,
): Promise<void> {
  return db.transaction(async tx => {
    const row = await getDraftRow(tx, id);
    if (
      row.status !== QUICK_BOOK_DRAFT_STATUS.generating &&
      row.status !== QUICK_BOOK_DRAFT_STATUS.failed
    ) {
      throw new Error(`草稿状态不允许标记失败: ${row.status}`);
    }
    await tx
      .update(quickBookDrafts)
      .set({
        status: QUICK_BOOK_DRAFT_STATUS.failed,
        errorText: typeof errorText === 'string' ? errorText : '',
        updatedTime: Date.now(),
      })
      .where(eq(quickBookDrafts.id, id));
  });
}

export async function getQuickBookDraftItem(
  db: Database,
  id: string,
  itemIndex: number,
): Promise<DraftItem> {
  const row = await getDraftRow(db, id);
  return getItemAtIndex(parseDraftItems(row.payload, Date.now()), itemIndex);
}

async function getDraftTypeRow(
  tx: Tx,
  typeId: number,
  booksId: number,
): Promise<TypeRow> {
  if (!Number.isInteger(typeId) || typeId <= 0) {
    throw new Error('请选择记账类型');
  }
  const row = await tx.select().from(types).where(eq(types.id, typeId)).get();
  if (!row) throw new Error(`记账类型不存在: ${typeId}`);
  if (row.booksId !== booksId) {
    throw new Error('记账类型不属于目标账本');
  }
  return row;
}

async function buildConfirmRecordInput(
  tx: Tx,
  draftRow: QuickBookDraftDbRow,
  item: DraftItem,
  input: CreateRecordInput | undefined,
): Promise<CreateRecordInput> {
  const booksId = draftRow.booksId;
  const book = await tx
    .select({ id: books.id })
    .from(books)
    .where(eq(books.id, booksId))
    .get();
  if (!book) throw new Error(`账本不存在: ${booksId}`);

  const typeId = input?.typeId ?? item.typeId;
  const typeRow = await getDraftTypeRow(tx, typeId, booksId);

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

  // P1 直接复用草稿图片路径（本地账本 file:// 约定）；
  // P4 把图片转入媒体存储后，可通过 input.imagePaths 覆盖或传 [] 取消。
  const imagePaths =
    input?.imagePaths ?? (draftRow.imagePath ? [draftRow.imagePath] : []);

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

/**
 * 确认草稿中的一笔：同一事务内重新读取草稿、校验、写入记录并回写草稿。
 * 同一 itemIndex 重复调用幂等，返回已有 recordId。
 */
export function confirmQuickBookDraftItem(
  db: Database,
  draftId: string,
  itemIndex: number,
  input?: CreateRecordInput,
): Promise<ConfirmQuickBookDraftItemResult> {
  return db.transaction(async tx => {
    const draftRow = await getDraftRow(tx, draftId);
    const now = Date.now();
    const items = parseDraftItems(draftRow.payload, now);
    const item = getItemAtIndex(items, itemIndex);

    if (draftRow.status === QUICK_BOOK_DRAFT_STATUS.discarded) {
      throw new Error('草稿已丢弃，无法确认');
    }
    if (item.status === 'confirmed' && item.recordId > 0) {
      return { item, recordId: item.recordId };
    }
    if (draftRow.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
      throw new Error('草稿已完成确认');
    }
    if (draftRow.status !== QUICK_BOOK_DRAFT_STATUS.pending) {
      throw new Error(`草稿状态不允许确认: ${draftRow.status}`);
    }

    const recordInput = await buildConfirmRecordInput(
      tx,
      draftRow,
      item,
      input,
    );
    const record = await createRecordInTransaction(tx, recordInput);

    const nextItems = items.map((current, index) =>
      index === itemIndex
        ? { ...current, status: 'confirmed' as const, recordId: record.id }
        : current,
    );
    const confirmedCount = nextItems.filter(
      current => current.status === 'confirmed',
    ).length;
    const allConfirmed =
      nextItems.length > 0 && confirmedCount === nextItems.length;
    const recordIds = nextItems
      .filter(current => current.status === 'confirmed')
      .map(current => current.recordId);

    await tx
      .update(quickBookDrafts)
      .set({
        status: allConfirmed
          ? QUICK_BOOK_DRAFT_STATUS.confirmed
          : QUICK_BOOK_DRAFT_STATUS.pending,
        payload: JSON.stringify(nextItems),
        confirmedCount,
        recordIds: JSON.stringify(recordIds),
        confirmedAt: allConfirmed ? now : 0,
        updatedTime: now,
      })
      .where(eq(quickBookDrafts.id, draftId));

    return {
      item: { ...item, status: 'confirmed', recordId: record.id },
      recordId: record.id,
    };
  });
}

/**
 * 丢弃草稿并返回待删除图片路径；已丢弃时幂等返回空数组。
 * 文件删除由调用方执行（data 包不引入平台文件系统依赖）。
 */
export function discardQuickBookDraft(
  db: Database,
  id: string,
): Promise<string[]> {
  return db.transaction(async tx => {
    const row = await getDraftRow(tx, id);
    if (row.status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
      throw new Error('草稿已完成确认，无法丢弃');
    }
    if (row.status === QUICK_BOOK_DRAFT_STATUS.discarded) {
      return [];
    }
    await tx
      .update(quickBookDrafts)
      .set({
        status: QUICK_BOOK_DRAFT_STATUS.discarded,
        updatedTime: Date.now(),
      })
      .where(eq(quickBookDrafts.id, id));
    return row.imagePath ? [row.imagePath] : [];
  });
}

/**
 * 清理草稿：超时 generating 标记 failed；过期 discarded / confirmed 删除行。
 * 返回被删除行的图片路径（去重），文件由调用方删除。
 */
export function cleanupQuickBookDrafts(db: Database): Promise<string[]> {
  return db.transaction(async tx => {
    const now = Date.now();
    const [activeDrafts, bookRows] = await Promise.all([
      tx
        .select({
          id: quickBookDrafts.id,
          booksId: quickBookDrafts.booksId,
        })
        .from(quickBookDrafts)
        .where(
          inArray(quickBookDrafts.status, [
            QUICK_BOOK_DRAFT_STATUS.generating,
            QUICK_BOOK_DRAFT_STATUS.pending,
          ]),
        )
        .all(),
      tx.select({ id: books.id }).from(books).all(),
    ]);
    const existingBookIds = new Set(bookRows.map(book => book.id));
    const missingBookDraftIds = activeDrafts
      .filter(draft => !existingBookIds.has(draft.booksId))
      .map(draft => draft.id);
    if (missingBookDraftIds.length > 0) {
      await tx
        .update(quickBookDrafts)
        .set({
          status: QUICK_BOOK_DRAFT_STATUS.failed,
          errorText: '目标账本已不存在',
          updatedTime: now,
        })
        .where(inArray(quickBookDrafts.id, missingBookDraftIds));
    }

    await tx
      .update(quickBookDrafts)
      .set({
        status: QUICK_BOOK_DRAFT_STATUS.failed,
        errorText: GENERATING_TIMEOUT_ERROR,
        updatedTime: now,
      })
      .where(
        and(
          eq(quickBookDrafts.status, QUICK_BOOK_DRAFT_STATUS.generating),
          lt(quickBookDrafts.updatedTime, now - GENERATING_TIMEOUT_MS),
        ),
      );

    const expiredDiscarded = await tx
      .delete(quickBookDrafts)
      .where(
        and(
          eq(quickBookDrafts.status, QUICK_BOOK_DRAFT_STATUS.discarded),
          lt(quickBookDrafts.updatedTime, now - DISCARDED_RETENTION_MS),
        ),
      )
      .returning({ imagePath: quickBookDrafts.imagePath });
    const expiredConfirmed = await tx
      .delete(quickBookDrafts)
      .where(
        and(
          eq(quickBookDrafts.status, QUICK_BOOK_DRAFT_STATUS.confirmed),
          lt(quickBookDrafts.confirmedAt, now - CONFIRMED_RETENTION_MS),
        ),
      )
      .returning({ imagePath: quickBookDrafts.imagePath });

    return Array.from(
      new Set(
        [...expiredDiscarded, ...expiredConfirmed]
          .map(row => row.imagePath)
          .filter(imagePath => imagePath !== ''),
      ),
    );
  });
}
