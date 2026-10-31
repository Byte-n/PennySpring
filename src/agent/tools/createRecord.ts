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
  resolveCreateRecordInput,
} from '../projection/recordDraft';
import { createAgentTool } from './createAgentTool';

export const CREATE_RECORD_TOOL_NAME = 'createRecord';

export const CREATE_RECORD_MAX_ATTACHMENT_COUNT = 3;

export const CREATE_RECORD_TOOL_DESCRIPTION =
  '在当前账本创建一条记账记录。调用后会先请求用户确认，只有用户确认且工具返回成功后才算写入。金额单位元；typeId 来自 listTypes，tagIds 来自 listTags，转账的 assetId/intoAssetId 来自 listAssets。支出/收入可以不填资产；转账必须填写转出和转入资产。记录需要图片凭证时，从用户消息里的【图片附件 ...】标注中选择 attachmentIds。退款/报销等吸收类收入暂不支持。';

export const createRecordInputSchema = z.object({
  typeId: z
    .number()
    .int()
    .positive()
    .describe('类型 id，必须来自 listTypes，且选择具体子类型。'),
  amount: z
    .number()
    .positive()
    .max(CREATE_RECORD_MAX_AMOUNT_YUAN)
    .describe('金额，单位元，最多两位小数。'),
  date: z
    .string()
    .regex(CREATE_RECORD_DATE_PATTERN, 'date 必须是 YYYY-MM-DD 格式')
    .optional()
    .describe('记账日期，格式 YYYY-MM-DD，默认今天。'),
  time: z
    .string()
    .regex(CREATE_RECORD_TIME_PATTERN, 'time 必须是 HH:mm 格式')
    .optional()
    .describe('记账时间，格式 HH:mm，默认当前时间。'),
  remark: z
    .string()
    .max(
      CREATE_RECORD_MAX_REMARK_LENGTH,
      `remark 不能超过 ${CREATE_RECORD_MAX_REMARK_LENGTH} 字`,
    )
    .optional()
    .describe('备注。'),
  tagIds: z
    .array(z.number().int().positive())
    .max(
      CREATE_RECORD_MAX_TAG_COUNT,
      `tagIds 最多 ${CREATE_RECORD_MAX_TAG_COUNT} 个`,
    )
    .optional()
    .describe('标签 id 列表，必须来自 listTags。'),
  charge: z
    .number()
    .min(0)
    .max(CREATE_RECORD_MAX_AMOUNT_YUAN)
    .optional()
    .describe('手续费，单位元，默认 0。'),
  assetId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('支出/收入关联的资产 id；转账时是转出资产 id。'),
  intoAssetId: z
    .number()
    .int()
    .positive()
    .optional()
    .describe('转账的转入资产 id，仅转账需要。'),
  reimbursable: z.boolean().optional().describe('支出是否可报销，默认 false。'),
  attachmentIds: z
    .array(z.string().min(1))
    .max(
      CREATE_RECORD_MAX_ATTACHMENT_COUNT,
      `attachmentIds 最多 ${CREATE_RECORD_MAX_ATTACHMENT_COUNT} 个`,
    )
    .optional()
    .describe(
      '记录图片附件的 id 列表，必须来自用户消息里的【图片附件 ...】标注，不要编造。',
    ),
});

export type CreateRecordToolInput = z.infer<typeof createRecordInputSchema>;

export interface CreateRecordToolDeps {
  api: Api;
  booksId: number;
  /** 当前会话可引用的图片附件，按 id 由模型选择。 */
  attachments?: readonly AgentAttachment[];
}

export function createCreateRecordTool(deps: CreateRecordToolDeps) {
  return createAgentTool({
    name: CREATE_RECORD_TOOL_NAME,
    description: CREATE_RECORD_TOOL_DESCRIPTION,
    inputSchema: createRecordInputSchema,
    execute: async input => {
      const { resolved: resolvedAttachments, missingIds } =
        resolveAttachmentsByIds(deps.attachments ?? [], input.attachmentIds ?? []);
      if (missingIds.length > 0) {
        const available = (deps.attachments ?? [])
          .map(attachment => attachment.id)
          .join('、');
        throw new Error(
          `未知附件 id：${missingIds.join('、')}。可用附件：${available || '无'}`,
        );
      }

      const [types, tags, assets] = await Promise.all([
        deps.api.type.getAll(deps.booksId),
        deps.api.tag.getAll(deps.booksId),
        deps.api.asset.getByBook(deps.booksId),
      ]);
      const resolved = resolveCreateRecordInput(deps.booksId, input, {
        types,
        tags,
        assets,
      });
      if (!resolved.ok) {
        throw new Error(resolved.error);
      }

      const imagePaths = resolvedAttachments.map(
        attachment => attachment.localPath,
      );
      const row = await deps.api.record.create({
        ...resolved.draft.createInput,
        ...(imagePaths.length > 0 ? { imagePaths } : {}),
      });
      return {
        ok: true,
        recordId: row.id,
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
