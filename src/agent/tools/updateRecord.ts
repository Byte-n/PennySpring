import dayjs from 'dayjs';
import type { Api } from '@pennyspring/api';
import { z } from 'zod';

import {
  resolveAttachmentsByIds,
  type AgentAttachment,
} from '../core/attachments';
import {
  CREATE_RECORD_DATE_PATTERN,
  CREATE_RECORD_MAX_AMOUNT_YUAN,
  CREATE_RECORD_MAX_REMARK_LENGTH,
  CREATE_RECORD_MAX_TAG_COUNT,
  CREATE_RECORD_TIME_PATTERN,
} from '../projection/recordDraft';
import { resolveUpdateRecordInput } from '../projection/recordUpdateDraft';
import { CREATE_RECORD_MAX_ATTACHMENT_COUNT } from './createRecord';
import { createAgentTool } from './createAgentTool';

export const UPDATE_RECORD_TOOL_NAME = 'updateRecord';

export const UPDATE_RECORD_TOOL_DESCRIPTION =
  '修改当前账本已有的一条记账记录。recordId 必须来自 queryRecords 明细里的 id；只传需要修改的字段，未传的字段保持原值，tagIds 传入时整体替换标签，传空数组清空标签。可用 attachmentIds 给记录追加图片凭证，原有图片始终保留。调用后会先请求用户确认，只有用户确认且工具返回成功后才算修改。退款/报销等吸收类记录暂不支持修改。';

export const updateRecordInputSchema = z.object({
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
    .describe('新的类型 id，必须来自 listTypes，且选择具体子类型；不传保持原类型。'),
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
    .describe('新的标签 id 列表，必须来自 listTags；传入时整体替换标签，传空数组清空，不传保持原标签。'),
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

export type UpdateRecordToolInput = z.infer<typeof updateRecordInputSchema>;

export interface UpdateRecordToolDeps {
  api: Api;
  booksId: number;
  /** 当前会话可引用的图片附件，按 id 由模型选择。 */
  attachments?: readonly AgentAttachment[];
}

export function createUpdateRecordTool(deps: UpdateRecordToolDeps) {
  return createAgentTool({
    name: UPDATE_RECORD_TOOL_NAME,
    description: UPDATE_RECORD_TOOL_DESCRIPTION,
    inputSchema: updateRecordInputSchema,
    execute: async input => {
      const { recordId, attachmentIds, ...args } = input;
      const { resolved: resolvedAttachments, missingIds } =
        resolveAttachmentsByIds(deps.attachments ?? [], attachmentIds ?? []);
      if (missingIds.length > 0) {
        const available = (deps.attachments ?? [])
          .map(attachment => attachment.id)
          .join('、');
        throw new Error(
          `未知附件 id：${missingIds.join('、')}。可用附件：${available || '无'}`,
        );
      }

      const [detail, types, tags, assets] = await Promise.all([
        deps.api.record.getDetailById(recordId, deps.booksId),
        deps.api.type.getAll(deps.booksId),
        deps.api.tag.getAll(deps.booksId),
        deps.api.asset.getByBook(deps.booksId),
      ]);
      const resolved = resolveUpdateRecordInput(
        deps.booksId,
        {
          record: detail.record,
          tagIds: detail.tagIds,
          imagePaths: detail.imagePaths,
          addedImagePaths: resolvedAttachments.map(attachment => attachment.ref),
        },
        { recordId, ...args },
        { types, tags, assets },
      );
      if (!resolved.ok) {
        throw new Error(resolved.error);
      }
      if (resolved.changes.length === 0) {
        throw new Error('没有需要修改的内容');
      }

      const row = await deps.api.record.update(resolved.updateInput);
      return {
        ok: true,
        recordId: row.id,
        changes: resolved.changes.map(change => change.label),
        category: resolved.draft.category,
        type: resolved.draft.typePath,
        amountYuan: resolved.draft.amountCents / 100,
        recordTime: dayjs(resolved.draft.recordTime).format(
          'YYYY-MM-DD HH:mm',
        ),
      };
    },
  });
}
