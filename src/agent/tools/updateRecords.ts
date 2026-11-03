import dayjs from 'dayjs';
import type { Api, UpdateRecordInput } from '@pennyspring/api';
import { z } from 'zod';

import {
  resolveAttachmentsByIds,
  type AgentAttachment,
} from '../core/attachments';
import { AGENT_BATCH_MAX_COUNT } from '../core/constants';
import {
  CREATE_RECORD_DATE_PATTERN,
  CREATE_RECORD_MAX_AMOUNT_YUAN,
  CREATE_RECORD_MAX_REMARK_LENGTH,
  CREATE_RECORD_MAX_TAG_COUNT,
  CREATE_RECORD_TIME_PATTERN,
  type RecordMetadata,
  type ResolvedRecordDraft,
} from '../projection/recordDraft';
import {
  resolveUpdateRecordInput,
  type RecordChange,
} from '../projection/recordUpdateDraft';
import { CREATE_RECORD_MAX_ATTACHMENT_COUNT } from './createRecords';
import { createAgentTool } from './createAgentTool';

export const UPDATE_RECORDS_TOOL_NAME = 'updateRecords';

export const UPDATE_RECORDS_TOOL_DESCRIPTION =
  '批量修改当前账本已有的记账记录，整批记录一次确认、同事务写入，任何一条失败都不会修改。recordId 必须来自 queryRecords 明细里的 id，且不能重复；每条只传需要修改的字段，未传的字段保持原值，tagIds 传入时整体替换标签，传空数组清空标签。可用 attachmentIds 给记录追加图片凭证，原有图片始终保留。退款/报销等吸收类记录暂不支持修改。';

export const updateRecordArgsSchema = z.object({
  recordId: z
    .number()
    .int()
    .positive()
    .describe('要修改的记录 id，必须来自 queryRecords 明细分组的记录 id。'),
  typeId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe(
      '新的类型 id，必须来自 listTypes，且选择具体子类型；不传保持原类型。',
    ),
  amount: z
    .number()
    .positive()
    .max(CREATE_RECORD_MAX_AMOUNT_YUAN)
    .optional()
    .describe('新的金额，单位元，最多两位小数；不传保持原金额。'),
  date: z
    .string()
    .regex(CREATE_RECORD_DATE_PATTERN, 'date 必须是 YYYY-MM-DD 格式')
    .optional()
    .describe('新的记账日期，格式 YYYY-MM-DD；不传保持原日期。'),
  time: z
    .string()
    .regex(CREATE_RECORD_TIME_PATTERN, 'time 必须是 HH:mm 格式')
    .optional()
    .describe('新的记账时间，格式 HH:mm；不传保持原时间。'),
  remark: z
    .string()
    .max(
      CREATE_RECORD_MAX_REMARK_LENGTH,
      `remark 不能超过 ${CREATE_RECORD_MAX_REMARK_LENGTH} 字`,
    )
    .optional()
    .describe('新的备注；传空串清空备注，不传保持原备注。'),
  tagIds: z
    .array(z.number().int().positive())
    .max(
      CREATE_RECORD_MAX_TAG_COUNT,
      `tagIds 最多 ${CREATE_RECORD_MAX_TAG_COUNT} 个`,
    )
    .optional()
    .describe(
      '新的标签 id 列表，必须来自 listTags；传入时整体替换标签，传空数组清空，不传保持原标签。',
    ),
  charge: z
    .number()
    .min(0)
    .max(CREATE_RECORD_MAX_AMOUNT_YUAN)
    .optional()
    .describe('新的手续费，单位元；不传保持原手续费。'),
  assetId: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('新的转出/关联资产 id；传 0 取消资产关联，不传保持原资产。'),
  intoAssetId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('新的转入资产 id，仅转账需要；不传保持原转入资产。'),
  reimbursable: z
    .boolean()
    .optional()
    .describe('支出是否可报销；不传保持原值。'),
  attachmentIds: z
    .array(z.string().min(1))
    .max(
      CREATE_RECORD_MAX_ATTACHMENT_COUNT,
      `attachmentIds 最多 ${CREATE_RECORD_MAX_ATTACHMENT_COUNT} 个`,
    )
    .optional()
    .describe(
      '追加到记录的图片附件 id 列表，必须来自用户消息里的【图片附件 ...】标注，不要编造。',
    ),
});

export const updateRecordsInputSchema = z.object({
  updates: z
    .array(updateRecordArgsSchema)
    .min(1, '至少修改一条记录')
    .max(AGENT_BATCH_MAX_COUNT, `一次最多修改 ${AGENT_BATCH_MAX_COUNT} 条记录`)
    .refine(
      updates =>
        new Set(updates.map(update => update.recordId)).size === updates.length,
      'updates 不能包含重复的 recordId',
    )
    .describe('要修改的记录列表。'),
});

export type UpdateRecordsToolInput = z.infer<typeof updateRecordsInputSchema>;

export interface UpdateRecordsToolDeps {
  api: Api;
  booksId: number;
  /** 当前会话可引用的图片附件，按 id 由模型选择。 */
  attachments?: readonly AgentAttachment[];
  /** 批量更新成功后通知应用层失效记录数据。 */
  onRecordsChanged?: () => void;
}

function resolveAllAttachments(
  attachments: readonly AgentAttachment[],
  ids: readonly string[],
): readonly AgentAttachment[] {
  const { resolved, missingIds } = resolveAttachmentsByIds(attachments, ids);
  if (missingIds.length > 0) {
    const available = attachments.map(item => item.id).join('、');
    throw new Error(
      `未知附件 id：${missingIds.join('、')}。可用附件：${available || '无'}`,
    );
  }
  return resolved;
}

interface ResolvedUpdateBatchItem {
  draft: ResolvedRecordDraft;
  updateInput: UpdateRecordInput;
  changes: RecordChange[];
}

export function createUpdateRecordsTool(deps: UpdateRecordsToolDeps) {
  return createAgentTool({
    name: UPDATE_RECORDS_TOOL_NAME,
    description: UPDATE_RECORDS_TOOL_DESCRIPTION,
    inputSchema: updateRecordsInputSchema,
    execute: async input => {
      const allAttachmentIds = input.updates.flatMap(
        update => update.attachmentIds ?? [],
      );
      const resolvedAttachments = resolveAllAttachments(
        deps.attachments ?? [],
        allAttachmentIds,
      );
      const attachmentById = new Map(
        resolvedAttachments.map(attachment => [attachment.id, attachment]),
      );

      const recordIds = input.updates.map(update => update.recordId);
      if (new Set(recordIds).size !== recordIds.length) {
        throw new Error('updates 不能包含重复的 recordId');
      }
      const [details, types, tags, assets] = await Promise.all([
        Promise.all(
          recordIds.map(recordId =>
            deps.api.record.getDetailById(recordId, deps.booksId),
          ),
        ),
        deps.api.type.getAll(deps.booksId),
        deps.api.tag.getAll(deps.booksId),
        deps.api.asset.getByBook(deps.booksId),
      ]);
      const detailById = new Map(
        details.map(detail => [detail.record.id, detail]),
      );
      const metadata: RecordMetadata = { types, tags, assets };

      const resolvedItems: ResolvedUpdateBatchItem[] = [];
      const updateInputs: UpdateRecordInput[] = [];
      const errors: string[] = [];

      input.updates.forEach((update, index) => {
        const detail = detailById.get(update.recordId);
        if (!detail) {
          errors.push(`第 ${index + 1} 条：记录 ${update.recordId} 不存在`);
          return;
        }
        const addedImagePaths = (update.attachmentIds ?? [])
          .map(attachmentId => attachmentById.get(attachmentId)?.ref)
          .filter((ref): ref is string => Boolean(ref));
        const resolved = resolveUpdateRecordInput(
          deps.booksId,
          {
            record: detail.record,
            tagIds: detail.tagIds,
            imagePaths: detail.imagePaths,
            addedImagePaths,
          },
          update,
          metadata,
        );
        if (!resolved.ok) {
          errors.push(`第 ${index + 1} 条：${resolved.error}`);
          return;
        }
        if (resolved.changes.length === 0) {
          errors.push(`第 ${index + 1} 条：没有需要修改的内容`);
          return;
        }
        resolvedItems.push({
          draft: resolved.draft,
          updateInput: resolved.updateInput,
          changes: resolved.changes,
        });
        updateInputs.push(resolved.updateInput);
      });

      if (errors.length > 0) {
        throw new Error(errors.join('；'));
      }

      const rows = await deps.api.record.updateMany(updateInputs);
      deps.onRecordsChanged?.();
      return {
        ok: true,
        count: rows.length,
        records: rows.map((row, index) => {
          const item = resolvedItems[index];
          return {
            recordId: row.id,
            changes: item?.changes.map(change => change.label) ?? [],
            category: item?.draft.category ?? '',
            type: item?.draft.typePath ?? '',
            amountYuan: (item?.draft.amountCents ?? 0) / 100,
            recordTime: item
              ? dayjs(item.draft.recordTime).format('YYYY-MM-DD HH:mm')
              : '',
          };
        }),
      };
    },
  });
}
