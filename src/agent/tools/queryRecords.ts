import type { Api } from '@pennyspring/api';
import { z } from 'zod';

import { parseQueryArguments, projectQueryResult } from '../projection/record';
import { createAgentTool } from './createAgentTool';

export const QUERY_RECORDS_TOOL_NAME = 'queryRecords';

export const QUERY_RECORDS_TOOL_DESCRIPTION =
  '查询当前账本的记账记录（只读）。金额单位为元。可按日期区间、类型、标签、备注关键词过滤，也可按日/月/类型/标签汇总。明细中的 id 可用于 updateRecords 修改或 deleteRecords 删除记录。';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const queryRecordsInputSchema = z.object({
  from: z
    .string()
    .regex(DATE_PATTERN, 'from 必须是 YYYY-MM-DD 格式')
    .optional()
    .describe('起始日期，格式 YYYY-MM-DD，包含当天。'),
  to: z
    .string()
    .regex(DATE_PATTERN, 'to 必须是 YYYY-MM-DD 格式')
    .optional()
    .describe('结束日期，格式 YYYY-MM-DD，包含当天。'),
  typeIds: z
    .array(z.number().int().positive())
    .optional()
    .describe('类型 ID 列表；传一级类型时会包含其子类型。'),
  tagIds: z
    .array(z.number().int().positive())
    .optional()
    .describe('标签 ID 列表；记录命中任一标签即包含。'),
  keyword: z
    .string()
    .optional()
    .describe('在备注中搜索的关键词，不区分大小写。'),
  groupBy: z
    .enum(['none', 'day', 'type', 'tag', 'month'])
    .optional()
    .describe('汇总维度。none 返回明细；其它值返回分组汇总且不返回明细。'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe('明细条数上限，默认 20；仅在 groupBy=none 时生效。'),
});

export interface QueryRecordsToolDeps {
  api: Api;
  booksId: number;
  bookName: string;
}

export function createQueryRecordsTool(deps: QueryRecordsToolDeps) {
  return createAgentTool({
    name: QUERY_RECORDS_TOOL_NAME,
    description: QUERY_RECORDS_TOOL_DESCRIPTION,
    inputSchema: queryRecordsInputSchema,
    execute: async input => {
      const options = parseQueryArguments(JSON.stringify(input));
      const [records, types, tags, recordTags] = await Promise.all([
        deps.api.record.getByBook(deps.booksId),
        deps.api.type.getAll(deps.booksId),
        deps.api.tag.getAll(deps.booksId),
        deps.api.record.getRecordTags(deps.booksId),
      ]);

      return JSON.stringify(
        projectQueryResult({
          bookName: deps.bookName,
          options,
          records,
          types,
          tags,
          recordTags,
        }),
      );
    },
  });
}
