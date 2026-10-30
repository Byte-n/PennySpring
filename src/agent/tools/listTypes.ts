import type { Api } from '@pennyspring/api';
import {
  RECORD_TYPE_CATEGORY,
  type RecordTypeCategoryValue,
  type TypeRow,
} from '@pennyspring/api';
import { z } from 'zod';

import {
  formatTypeDisplayName,
  getParentTypeIds,
  MAX_METADATA_ROWS,
  renderMarkdownTable,
  sortTypesForDisplay,
} from '../projection/metadata';
import { createAgentTool } from './createAgentTool';

export const LIST_TYPES_TOOL_NAME = 'listTypes';

export const LIST_TYPES_TOOL_DESCRIPTION =
  '列出当前账本的记录类型，返回精简 markdown 表格（id、名称、父类型）。创建记录前用它获取 typeId，可按分类或名称过滤。';

const CATEGORY_ORDER: readonly RecordTypeCategoryValue[] = [
  RECORD_TYPE_CATEGORY.expense,
  RECORD_TYPE_CATEGORY.income,
  RECORD_TYPE_CATEGORY.transfer,
];

const listTypesInputSchema = z.object({
  category: z
    .enum(['expense', 'income', 'transfer'])
    .optional()
    .describe('按分类过滤：expense 支出、income 收入、transfer 转账。'),
  keyword: z.string().optional().describe('按类型名称模糊过滤，不区分大小写。'),
});

export type ListTypesInput = z.infer<typeof listTypesInputSchema>;

export interface ListTypesToolDeps {
  api: Api;
  booksId: number;
}

export function projectTypeList(
  types: readonly TypeRow[],
  input: ListTypesInput,
): string {
  if (types.length === 0) {
    return '当前账本没有可用类型。';
  }

  const keyword = input.keyword?.trim().toLocaleLowerCase() ?? '';
  const filtered = types.filter(
    type =>
      (input.category === undefined || type.typeCategory === input.category) &&
      (keyword === '' || type.name.toLocaleLowerCase().includes(keyword)),
  );
  if (filtered.length === 0) {
    return '没有匹配的类型。';
  }

  const parentIds = getParentTypeIds(types);
  const typeById = new Map(types.map(type => [type.id, type]));
  const sorted = sortTypesForDisplay(filtered);
  const categories = input.category ? [input.category] : CATEGORY_ORDER;
  let remaining = MAX_METADATA_ROWS;
  const sections = categories.flatMap(category => {
    if (remaining <= 0) {
      return [];
    }
    const rows = sorted
      .filter(type => type.typeCategory === category)
      .slice(0, remaining)
      .map(type => [
        String(type.id),
        formatTypeDisplayName(type, parentIds.has(type.id)),
        type.parentId === 0 ? '' : typeById.get(type.parentId)?.name ?? '',
      ]);
    remaining -= rows.length;
    if (rows.length === 0) {
      return [];
    }
    return [
      `## ${RECORD_TYPE_CATEGORY.label(category)}\n\n${renderMarkdownTable(
        ['id', '名称', '父类型'],
        rows,
      )}`,
    ];
  });

  if (sections.length === 0) {
    return '没有匹配的类型。';
  }

  const shown = MAX_METADATA_ROWS - remaining;
  const truncated =
    sorted.length > shown ? `\n\n（已截断，仅显示前 ${shown} 条）` : '';
  return `${sections.join('\n\n')}${truncated}`;
}

export function createListTypesTool(deps: ListTypesToolDeps) {
  return createAgentTool({
    name: LIST_TYPES_TOOL_NAME,
    description: LIST_TYPES_TOOL_DESCRIPTION,
    inputSchema: listTypesInputSchema,
    execute: async input => {
      const types = await deps.api.type.getAll(deps.booksId);
      return projectTypeList(types, input);
    },
  });
}
