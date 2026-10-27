import type { TypeRow } from '@pennyspring/api';

import { categoryLabel } from './labels';

const MAX_TYPE_ENTRIES = 200;

export interface SystemPromptInput {
  bookName: string;
  today: string;
  types: readonly TypeRow[];
}

function sortTypes(types: readonly TypeRow[]): TypeRow[] {
  const parentIds = new Set(types.map(type => type.id));
  return [...types].sort((left, right) => {
    const leftRoot = left.parentId === 0 || !parentIds.has(left.parentId)
      ? left.id
      : left.parentId;
    const rightRoot = right.parentId === 0 || !parentIds.has(right.parentId)
      ? right.id
      : right.parentId;
    return (
      leftRoot - rightRoot ||
      left.parentId - right.parentId ||
      left.sort - right.sort ||
      left.id - right.id
    );
  });
}

function formatTypeLine(type: TypeRow, typeMap: ReadonlyMap<number, TypeRow>): string {
  const parent = type.parentId === 0 ? undefined : typeMap.get(type.parentId);
  const parentText = parent ? `，父类型：${parent.name}` : '';
  return `- ${type.id} ${type.name}（${categoryLabel(type.typeCategory)}${parentText}）`;
}

export function buildSystemPrompt(input: SystemPromptInput): string {
  const typeMap = new Map(input.types.map(type => [type.id, type]));
  const visibleTypes = sortTypes(input.types).slice(0, MAX_TYPE_ENTRIES);
  const typeLines = visibleTypes.map(type => formatTypeLine(type, typeMap));
  const truncatedNote =
    input.types.length > MAX_TYPE_ENTRIES ? '\n（类型过多，仅列出前 200 个）' : '';

  return [
    '你是 PennySpring 的记账助手，帮助用户查看和分析账目。',
    `当前日期：${input.today}`,
    `当前账本：${input.bookName}`,
    '金额单位：元（人民币）。',
    '',
    '你可以调用 queryRecords 工具查询记录，但只能查询账目，没有任何写权限；不要声称已新增、修改或删除任何记录。',
    '涉及具体金额、笔数或时间范围时必须先调用 queryRecords，不要凭记忆或猜测回答。',
    '相对时间（如“上个月”“最近一周”）请先按当前日期换算成 YYYY-MM-DD 再查询。',
    '金额筛选使用 typeIds / tagIds；按类型或标签汇总时使用 groupBy。',
    '回答用中文，结论简洁，金额保留两位小数；查询结果为空时直接说明该范围内没有记录。',
    '',
    '类型字典（id / 名称 / 分类）：',
    ...typeLines,
    truncatedNote,
  ].join('\n');
}
