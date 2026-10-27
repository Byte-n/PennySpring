import type { Api } from '@pennyspring/api';

import type { ToolDefinition, ToolExecutor } from '../core/types';
import { parseQueryArguments, projectQueryResult } from '../projection/record';

export const QUERY_RECORDS_TOOL: ToolDefinition = {
  name: 'queryRecords',
  description:
    '查询当前账本的记账记录（只读）。金额单位为元。可按日期区间、类型、标签、备注关键词过滤，也可按日/月/类型/标签汇总。',
  parameters: {
    type: 'object',
    properties: {
      from: {
        type: 'string',
        description: '起始日期，格式 YYYY-MM-DD，包含当天。',
      },
      to: {
        type: 'string',
        description: '结束日期，格式 YYYY-MM-DD，包含当天。',
      },
      typeIds: {
        type: 'array',
        items: { type: 'integer' },
        description: '类型 ID 列表；传一级类型时会包含其子类型。',
      },
      tagIds: {
        type: 'array',
        items: { type: 'integer' },
        description: '标签 ID 列表；记录命中任一标签即包含。',
      },
      keyword: {
        type: 'string',
        description: '在备注中搜索的关键词，不区分大小写。',
      },
      groupBy: {
        type: 'string',
        enum: ['none', 'day', 'type', 'tag', 'month'],
        description:
          '汇总维度。none 返回明细；其它值返回分组汇总且不返回明细。',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        description: '明细条数上限，默认 20；仅在 groupBy=none 时生效。',
      },
    },
    required: [],
  },
};

export interface QueryRecordsToolDeps {
  api: Api;
  booksId: number;
  bookName: string;
}

export function createQueryRecordsTool(deps: QueryRecordsToolDeps): ToolExecutor {
  return async call => {
    if (call.name !== QUERY_RECORDS_TOOL.name) {
      throw new Error(`不支持的工具：${call.name || '未知'}`);
    }

    const options = parseQueryArguments(call.arguments);
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
  };
}
