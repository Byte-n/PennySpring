import {
  QUICK_BOOK_DRAFT_SOURCE,
  QUICK_BOOK_DRAFT_STATUS,
  type DraftItem,
  type DraftItemStatus,
  type QuickBookDraftAgentInfo,
  type QuickBookDraftPreset,
  type QuickBookDraftSourceValue,
  type QuickBookDraftStatusValue,
  type QuickBookDraftUpdateMeta,
} from '@pennyspring/api';

import type { DraftBookTarget } from './draftBook';
import { createDraftBookTarget } from './draftBook';

export interface CachedQuickBookDraft {
  id: string;
  target: DraftBookTarget;
  status: QuickBookDraftStatusValue;
  source: QuickBookDraftSourceValue;
  imagePath: string;
  attachImage: boolean;
  items: DraftItem[];
  preset: QuickBookDraftPreset;
  agentProviderId: number;
  agentModelId: string;
  agentSummary: string;
  errorText: string;
  attachmentRef: string;
  createdTime: number;
  updatedTime: number;
  confirmedAt: number;
}

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

export function assertDraftStatus(status: string): void {
  if (
    !QUICK_BOOK_DRAFT_STATUS.values().includes(
      status as QuickBookDraftStatusValue,
    )
  ) {
    throw new Error(`草稿状态非法: ${status}`);
  }
}

export function assertDraftSource(source: string): void {
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

function readAttemptId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function normalizeDraftItem(
  raw: unknown,
  index: number,
  mode: DraftItemMode,
  now: number,
  fallbackAttachImage = false,
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
    attachImage:
      mode === 'input'
        ? false
        : raw.attachImage === true ||
          (raw.attachImage === undefined && fallbackAttachImage),
    warnings: readWarnings(raw.warnings),
    ...(mode === 'stored'
      ? { confirmAttemptId: readAttemptId(raw.confirmAttemptId) }
      : {}),
  };
}

export function normalizeDraftItems(
  raw: unknown,
  mode: DraftItemMode,
  now: number,
  fallbackAttachImage = false,
): DraftItem[] {
  if (!Array.isArray(raw)) {
    throw new Error('草稿内容格式不正确');
  }
  return raw.map((item, index) =>
    normalizeDraftItem(item, index, mode, now, fallbackAttachImage),
  );
}

export function normalizePreset(
  input: Partial<QuickBookDraftPreset> | undefined,
): QuickBookDraftPreset {
  return {
    assetId: readNonNegativeInteger(input?.assetId, '草稿预设资产 id', 0),
    typeId: readNonNegativeInteger(input?.typeId, '草稿预设类型 id', 0),
  };
}

export function normalizeUpdateMeta(
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

export function normalizeAgentInfo(
  info: QuickBookDraftAgentInfo,
): QuickBookDraftAgentInfo {
  const agentProviderId = readNonNegativeInteger(
    info?.agentProviderId,
    '草稿提供商 id',
    0,
  );
  if (typeof info?.agentModelId !== 'string') {
    throw new Error('草稿模型 id 不合法');
  }
  return { agentProviderId, agentModelId: info.agentModelId };
}

function normalizeTarget(raw: unknown): DraftBookTarget {
  if (!isRecord(raw)) {
    throw new Error('草稿目标账本格式不正确');
  }
  return createDraftBookTarget({
    kind: raw.kind as DraftBookTarget['kind'],
    serverUrl: readString(raw.serverUrl, ''),
    booksId: readNonNegativeInteger(raw.booksId, '草稿目标账本 id', 0),
    bookName: readString(raw.bookName, ''),
  });
}

export function parseCachedDraft(
  id: string,
  raw: string,
): CachedQuickBookDraft {
  const parsed = parseJson(raw, '草稿缓存格式不正确');
  if (!isRecord(parsed)) {
    throw new Error('草稿缓存格式不正确');
  }
  if (parsed.id !== id) {
    throw new Error('草稿缓存 id 不匹配');
  }
  const status = readString(parsed.status, '');
  assertDraftStatus(status);
  const source = readString(parsed.source, '');
  assertDraftSource(source);
  const now = Date.now();
  const legacyAttachImage = parsed.attachImage === true;
  return {
    id,
    target: normalizeTarget(parsed.target),
    status: status as QuickBookDraftStatusValue,
    source: source as QuickBookDraftSourceValue,
    imagePath: readString(parsed.imagePath, ''),
    attachImage: legacyAttachImage,
    items: normalizeDraftItems(parsed.items, 'stored', now, legacyAttachImage),
    preset: normalizePreset(
      isRecord(parsed.preset)
        ? {
            assetId: parsed.preset.assetId as number | undefined,
            typeId: parsed.preset.typeId as number | undefined,
          }
        : undefined,
    ),
    agentProviderId: readNonNegativeInteger(
      parsed.agentProviderId,
      '草稿提供商 id',
      0,
    ),
    agentModelId: readString(parsed.agentModelId, ''),
    agentSummary: readString(parsed.agentSummary, ''),
    errorText: readString(parsed.errorText, ''),
    attachmentRef: readString(parsed.attachmentRef, ''),
    createdTime: readPositiveInteger(parsed.createdTime, '草稿创建时间', now),
    updatedTime: readPositiveInteger(parsed.updatedTime, '草稿更新时间', now),
    confirmedAt: readNonNegativeInteger(parsed.confirmedAt, '草稿确认时间', 0),
  };
}

export function getDraftItemAtIndex(
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
