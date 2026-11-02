import dayjs from 'dayjs';
import type { Api, CreateRecordInput } from '@pennyspring/api';
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
  resolveCreateRecordInput,
  type ResolvedRecordDraft,
} from '../projection/recordDraft';
import { createAgentTool } from './createAgentTool';

export const CREATE_RECORDS_TOOL_NAME = 'createRecords';

export const CREATE_RECORD_MAX_ATTACHMENT_COUNT = 3;

export const CREATE_RECORDS_TOOL_DESCRIPTION =
  '在当前账本批量创建记账记录。整批记录一次确认、同事务写入，任何一条失败都不会写入。金额单位元；typeId 来自 listTypes，tagIds 来自 listTags，转账的 assetId/intoAssetId 来自 listAssets。支出/收入可以不填资产；转账必须填写转出和转入资产。记录需要图片凭证时，从用户消息里的【图片附件 ...】标注中选择 attachmentIds。退款/报销等吸收类收入暂不支持。';

export const createRecordArgsSchema = z.object({
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

export const createRecordsInputSchema = z.object({
  records: z
    .array(createRecordArgsSchema)
    .min(1, '至少创建一条记录')
    .max(AGENT_BATCH_MAX_COUNT, `一次最多创建 ${AGENT_BATCH_MAX_COUNT} 条记录`)
    .describe('要创建的记录列表。'),
});

export type CreateRecordsToolInput = z.infer<typeof createRecordsInputSchema>;

export interface CreateRecordsToolDeps {
  api: Api;
  booksId: number;
  /** 当前会话可引用的图片附件，按 id 由模型选择。 */
  attachments?: readonly AgentAttachment[];
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

export function createCreateRecordsTool(deps: CreateRecordsToolDeps) {
  return createAgentTool({
    name: CREATE_RECORDS_TOOL_NAME,
    description: CREATE_RECORDS_TOOL_DESCRIPTION,
    inputSchema: createRecordsInputSchema,
    execute: async input => {
      const allAttachmentIds = input.records.flatMap(
        record => record.attachmentIds ?? [],
      );
      const resolvedAttachments = resolveAllAttachments(
        deps.attachments ?? [],
        allAttachmentIds,
      );
      const attachmentById = new Map(
        resolvedAttachments.map(attachment => [attachment.id, attachment]),
      );

      const [types, tags, assets] = await Promise.all([
        deps.api.type.getAll(deps.booksId),
        deps.api.tag.getAll(deps.booksId),
        deps.api.asset.getByBook(deps.booksId),
      ]);

      const drafts: ResolvedRecordDraft[] = [];
      const createInputs: CreateRecordInput[] = [];
      const errors: string[] = [];

      input.records.forEach((record, index) => {
        const resolved = resolveCreateRecordInput(deps.booksId, record, {
          types,
          tags,
          assets,
        });
        if (!resolved.ok) {
          errors.push(`第 ${index + 1} 笔：${resolved.error}`);
          return;
        }
        const imagePaths = (record.attachmentIds ?? [])
          .map(attachmentId => attachmentById.get(attachmentId)?.ref)
          .filter((ref): ref is string => Boolean(ref));
        drafts.push(resolved.draft);
        createInputs.push({
          ...resolved.draft.createInput,
          ...(imagePaths.length > 0 ? { imagePaths } : {}),
        });
      });

      if (errors.length > 0) {
        throw new Error(errors.join('；'));
      }

      const rows = await deps.api.record.createMany(createInputs);
      return {
        ok: true,
        count: rows.length,
        records: rows.map((row, index) => {
          const draft = drafts[index];
          return {
            recordId: row.id,
            category: draft?.category ?? '',
            type: draft?.typePath ?? '',
            amountYuan: (draft?.amountCents ?? 0) / 100,
            recordTime: draft
              ? dayjs(draft.recordTime).format('YYYY-MM-DD HH:mm')
              : '',
          };
        }),
      };
    },
  });
}
