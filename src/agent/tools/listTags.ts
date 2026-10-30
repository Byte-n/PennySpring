import type { Api } from '@pennyspring/api';
import { VISIBILITY, type TagRow } from '@pennyspring/api';
import { z } from 'zod';

import { MAX_METADATA_ROWS, renderMarkdownTable } from '../projection/metadata';
import { createAgentTool } from './createAgentTool';

export const LIST_TAGS_TOOL_NAME = 'listTags';

export const LIST_TAGS_TOOL_DESCRIPTION =
  '列出当前账本可用的标签，返回精简 markdown 表格（id、名称）。创建记录需要 tagIds 时先调用。';

const listTagsInputSchema = z.object({
  keyword: z.string().optional().describe('按标签名称模糊过滤，不区分大小写。'),
});

export type ListTagsInput = z.infer<typeof listTagsInputSchema>;

export interface ListTagsToolDeps {
  api: Api;
  booksId: number;
}

export function projectTagList(
  tags: readonly TagRow[],
  input: ListTagsInput,
): string {
  const visibleTags = tags.filter(tag => tag.invisible !== VISIBILITY.hidden);
  if (visibleTags.length === 0) {
    return '当前账本没有可用标签。';
  }

  const keyword = input.keyword?.trim().toLocaleLowerCase() ?? '';
  const filtered = visibleTags
    .filter(
      tag => keyword === '' || tag.name.toLocaleLowerCase().includes(keyword),
    )
    .sort((left, right) => left.id - right.id);
  if (filtered.length === 0) {
    return '没有匹配的标签。';
  }

  const limited = filtered.slice(0, MAX_METADATA_ROWS);
  const table = renderMarkdownTable(
    ['id', '标签'],
    limited.map(tag => [String(tag.id), tag.name]),
  );
  const truncated =
    filtered.length > MAX_METADATA_ROWS
      ? `\n\n（已截断，仅显示前 ${MAX_METADATA_ROWS} 条）`
      : '';
  return `${table}${truncated}`;
}

export function createListTagsTool(deps: ListTagsToolDeps) {
  return createAgentTool({
    name: LIST_TAGS_TOOL_NAME,
    description: LIST_TAGS_TOOL_DESCRIPTION,
    inputSchema: listTagsInputSchema,
    execute: async input => {
      const tags = await deps.api.tag.getAll(deps.booksId);
      return projectTagList(tags, input);
    },
  });
}
