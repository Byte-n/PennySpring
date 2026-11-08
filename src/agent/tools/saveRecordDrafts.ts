import dayjs from 'dayjs';
import type {
  Api,
  AssetRow,
  DraftItem,
  QuickBookDraftPreset,
  TypeRow,
} from '@pennyspring/api';
import type { ToolSet } from 'ai';
import { z } from 'zod';

import type { QuickBookDraftCache } from '../../features/quickBookDraft/draftCache';
import {
  CREATE_RECORD_DATE_PATTERN,
  CREATE_RECORD_MAX_AMOUNT_YUAN,
  CREATE_RECORD_TIME_PATTERN,
} from '../projection/recordDraft';
import { createAgentTool } from './createAgentTool';
import { createListAssetsTool, LIST_ASSETS_TOOL_NAME } from './listAssets';
import { createListTypesTool, LIST_TYPES_TOOL_NAME } from './listTypes';

export const SAVE_RECORD_DRAFTS_TOOL_NAME = 'saveRecordDrafts';

/** 一次最多生成的草稿笔数，超出部分截断。 */
export const QUICK_BOOK_DRAFT_MAX_ITEMS = 20;

const CENTS_PER_YUAN = 100;

export const SAVE_RECORD_DRAFTS_TOOL_DESCRIPTION =
  '把截图识别出的交易写入当前截图记账草稿（只写草稿，绝不写入账本记录）。金额单位元；不确定的字段留空并在 warnings 用中文说明。一次最多 20 笔，重复调用会覆盖当前草稿。';

const saveRecordDraftItemSchema = z.object({
  typeId: z
    .number()
    .optional()
    .describe('类型 id，必须来自 listTypes；无法判断时留空。'),
  amount: z
    .number()
    .optional()
    .describe('金额，单位元，最多两位小数；无法确定时留空，不要猜测。'),
  date: z
    .string()
    .optional()
    .describe('记账日期 YYYY-MM-DD；不明确时留空，默认今天。'),
  time: z
    .string()
    .optional()
    .describe('记账时间 HH:mm；不明确时留空，默认当前时间。'),
  remark: z.string().optional().describe('备注。'),
  assetId: z
    .number()
    .optional()
    .describe('资产 id，必须来自 listAssets；支出/收入可留空，转账必填。'),
  intoAssetId: z
    .number()
    .optional()
    .describe('转入资产 id，仅转账使用，必须来自 listAssets。'),
  charge: z.number().optional().describe('手续费，单位元。'),
  reimbursable: z
    .boolean()
    .optional()
    .describe('是否可报销，仅支出使用，默认否。'),
  warnings: z
    .array(z.string())
    .optional()
    .describe('该笔草稿的中文缺失说明，例如金额待确认。'),
});

const saveRecordDraftsInputSchema = z.object({
  summary: z.string().optional().describe('本次截图的中文摘要。'),
  items: z
    .array(saveRecordDraftItemSchema)
    .min(1)
    .describe('截图中的交易明细，按实际笔数拆分；一次最多 20 笔。'),
});

export type SaveRecordDraftItemInput = z.infer<
  typeof saveRecordDraftItemSchema
>;
export type SaveRecordDraftsInput = z.infer<typeof saveRecordDraftsInputSchema>;

interface EntityLike {
  id: number;
  name: string;
}

interface ResolveEntityOptions {
  label: string;
  presetId: number;
  byId: ReadonlyMap<number, EntityLike>;
}

interface ResolvedEntity {
  id: number;
  name: string;
  warning?: string;
}

interface ResolvedValue<T> {
  value: T;
  warning?: string;
}

function resolveEntity(
  rawId: number | undefined,
  options: ResolveEntityOptions,
): ResolvedEntity {
  if (options.presetId > 0) {
    const presetEntity = options.byId.get(options.presetId);
    return presetEntity
      ? { id: presetEntity.id, name: presetEntity.name }
      : {
          id: 0,
          name: '',
          warning: `预设${options.label}在当前账本中不存在，已留空待确认`,
        };
  }

  if (rawId === undefined || rawId === 0) {
    return { id: 0, name: '' };
  }
  if (!Number.isInteger(rawId) || rawId < 0) {
    return {
      id: 0,
      name: '',
      warning: `${options.label}无效，已留空待确认`,
    };
  }
  const entity = options.byId.get(rawId);
  return entity
    ? { id: entity.id, name: entity.name }
    : {
        id: 0,
        name: '',
        warning: `${options.label} ${rawId} 不属于当前账本，已留空待确认`,
      };
}

function resolveAmountCents(
  amount: number | undefined,
): ResolvedValue<number | null> {
  if (amount === undefined) {
    return {
      value: null,
      warning: '未识别到金额，请补充',
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return {
      value: null,
      warning: '金额不合法，已留空待确认',
    };
  }
  if (amount > CREATE_RECORD_MAX_AMOUNT_YUAN) {
    return {
      value: null,
      warning: `金额不能超过 ${CREATE_RECORD_MAX_AMOUNT_YUAN} 元，已留空待确认`,
    };
  }
  const cents = Math.round(amount * CENTS_PER_YUAN);
  return cents > 0
    ? { value: cents }
    : { value: null, warning: '金额不合法，已留空待确认' };
}

function resolveChargeCents(charge: number | undefined): ResolvedValue<number> {
  if (charge === undefined) {
    return { value: 0 };
  }
  if (
    !Number.isFinite(charge) ||
    charge < 0 ||
    charge > CREATE_RECORD_MAX_AMOUNT_YUAN
  ) {
    return { value: 0, warning: '手续费不合法，已按 0 处理' };
  }
  return { value: Math.round(charge * CENTS_PER_YUAN) };
}

function resolveRecordTime(
  dateValue: string | undefined,
  timeValue: string | undefined,
  now: number,
): ResolvedValue<number> {
  const nowDate = dayjs(now);
  const date = dateValue?.trim() || nowDate.format('YYYY-MM-DD');
  const time = timeValue?.trim() || nowDate.format('HH:mm');

  if (
    !CREATE_RECORD_DATE_PATTERN.test(date) ||
    !CREATE_RECORD_TIME_PATTERN.test(time)
  ) {
    return {
      value: now,
      warning: '日期或时间格式不正确，已按当前时间填充',
    };
  }

  const text = `${date} ${time}`;
  const parsed = dayjs(text);
  if (!parsed.isValid() || parsed.format('YYYY-MM-DD HH:mm') !== text) {
    return {
      value: now,
      warning: '日期或时间不合法，已按当前时间填充',
    };
  }
  return { value: parsed.valueOf() };
}

function readModelWarnings(warnings: readonly string[] | undefined): string[] {
  if (warnings === undefined) {
    return [];
  }
  return warnings
    .filter(warning => typeof warning === 'string')
    .map(warning => warning.trim())
    .filter(warning => warning !== '');
}

function compactWarnings(resolved: readonly { warning?: string }[]): string[] {
  return resolved
    .map(item => item.warning)
    .filter((warning): warning is string => warning !== undefined);
}

export interface NormalizeRecordDraftItemsParams {
  input: SaveRecordDraftsInput;
  booksId: number;
  preset: QuickBookDraftPreset;
  types: readonly TypeRow[];
  assets: readonly AssetRow[];
  now?: number;
}

/**
 * 把模型输出的草稿输入归一化为可持久化的 DraftItem[]。
 * 纯函数：不访问 DB、不修改入参，重复调用结果稳定（now 固定时）。
 */
export function normalizeRecordDraftItems(
  params: NormalizeRecordDraftItemsParams,
): DraftItem[] {
  const now = params.now ?? Date.now();
  const typesById = new Map(
    params.types
      .filter(type => type.booksId === params.booksId)
      .map(type => [type.id, type]),
  );
  const assetsById = new Map(
    params.assets
      .filter(asset => asset.booksId === params.booksId)
      .map(asset => [asset.id, asset]),
  );

  const items = params.input.items
    .slice(0, QUICK_BOOK_DRAFT_MAX_ITEMS)
    .map(raw => {
      const type = resolveEntity(raw.typeId, {
        label: '类型',
        presetId: params.preset.typeId,
        byId: typesById,
      });
      const asset = resolveEntity(raw.assetId, {
        label: '资产',
        presetId: params.preset.assetId,
        byId: assetsById,
      });
      const intoAsset = resolveEntity(raw.intoAssetId, {
        label: '转入资产',
        presetId: 0,
        byId: assetsById,
      });
      const amount = resolveAmountCents(raw.amount);
      const charge = resolveChargeCents(raw.charge);
      const recordTime = resolveRecordTime(raw.date, raw.time, now);

      return {
        status: 'pending' as const,
        recordId: 0,
        typeId: type.id,
        typeName: type.name,
        amountCents: amount.value,
        recordTime: recordTime.value,
        remark: typeof raw.remark === 'string' ? raw.remark.trim() : '',
        assetId: asset.id,
        assetName: asset.name,
        intoAssetId: intoAsset.id,
        intoAssetName: intoAsset.name,
        chargeCents: charge.value,
        tagIds: [],
        reimbursable: raw.reimbursable === true,
        warnings: [
          ...readModelWarnings(raw.warnings),
          ...compactWarnings([
            type,
            asset,
            intoAsset,
            amount,
            charge,
            recordTime,
          ]),
        ],
      };
    });

  const shouldTruncate =
    items.length > 0 && params.input.items.length > QUICK_BOOK_DRAFT_MAX_ITEMS;

  return items.map((item, index) =>
    shouldTruncate && index === items.length - 1
      ? {
          ...item,
          warnings: [
            ...item.warnings,
            `一次最多生成 ${QUICK_BOOK_DRAFT_MAX_ITEMS} 笔草稿，已截断超出部分`,
          ],
        }
      : item,
  );
}

export interface SaveRecordDraftsToolDeps {
  bookApi: Api;
  draftApi: QuickBookDraftCache;
  booksId: number;
  draftId: string;
  preset: QuickBookDraftPreset;
  imagePath: string;
  /** 整次运行超时后阻止旧任务继续覆盖草稿。 */
  abortSignal?: AbortSignal;
}

export interface SaveRecordDraftsOutput {
  draftId: string;
  itemCount: number;
}

function normalizeSummary(summary: string | undefined): string | undefined {
  const text = summary?.trim() ?? '';
  return text === '' ? undefined : text;
}

export function createSaveRecordDraftsTool(deps: SaveRecordDraftsToolDeps) {
  return createAgentTool({
    name: SAVE_RECORD_DRAFTS_TOOL_NAME,
    description: SAVE_RECORD_DRAFTS_TOOL_DESCRIPTION,
    inputSchema: saveRecordDraftsInputSchema,
    execute: async (input): Promise<SaveRecordDraftsOutput> => {
      if (!deps.imagePath.trim()) {
        throw new Error('草稿截图路径不能为空');
      }
      if (deps.abortSignal?.aborted) {
        throw new Error('生成已中止，请重试');
      }
      const [types, assets] = await Promise.all([
        deps.bookApi.type.getAll(deps.booksId),
        deps.bookApi.asset.getByBook(deps.booksId),
      ]);
      const items = normalizeRecordDraftItems({
        input,
        booksId: deps.booksId,
        preset: deps.preset,
        types,
        assets,
      });
      if (deps.abortSignal?.aborted) {
        throw new Error('生成已中止，请重试');
      }
      const summary = normalizeSummary(input.summary);
      await deps.draftApi.updateItems(
        deps.draftId,
        items,
        deps.preset,
        summary === undefined ? undefined : { agentSummary: summary },
      );
      return { draftId: deps.draftId, itemCount: items.length };
    },
  });
}

export type QuickBookDraftToolsDeps = SaveRecordDraftsToolDeps;

/**
 * 截图记账专用工具集：只含 listTypes、listAssets、saveRecordDrafts。
 * 不含任何写业务表或查询已有记录的工具。
 */
export function createQuickBookDraftTools(
  deps: QuickBookDraftToolsDeps,
): ToolSet {
  return {
    [LIST_TYPES_TOOL_NAME]: createListTypesTool({
      api: deps.bookApi,
      booksId: deps.booksId,
    }),
    [LIST_ASSETS_TOOL_NAME]: createListAssetsTool({
      api: deps.bookApi,
      booksId: deps.booksId,
    }),
    [SAVE_RECORD_DRAFTS_TOOL_NAME]: createSaveRecordDraftsTool(deps),
  };
}
