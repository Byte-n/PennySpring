import { RECORD_TYPE_SPECIAL_BEHAVIOR, type TypeRow } from '@pennyspring/api';

export const MAX_METADATA_ROWS = 200;

export function escapeTableCell(value: string): string {
  return value
    .replace(/\|/g, '\\|')
    .replace(/\r\n?|\n/g, '<br>')
    .trim();
}

export function renderMarkdownTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const header = `| ${headers.map(escapeTableCell).join(' | ')} |`;
  const separator = `| ${headers
    .map((_, index) => (index === 0 ? '---:' : '---'))
    .join(' | ')} |`;
  const body = rows
    .map(row => `| ${row.map(escapeTableCell).join(' | ')} |`)
    .join('\n');

  return body ? `${header}\n${separator}\n${body}` : `${header}\n${separator}`;
}

function getRootTypeId(type: TypeRow, typeIds: ReadonlySet<number>): number {
  return type.parentId === 0 || !typeIds.has(type.parentId)
    ? type.id
    : type.parentId;
}

export function sortTypesForDisplay(types: readonly TypeRow[]): TypeRow[] {
  const typeIds = new Set(types.map(type => type.id));
  return [...types].sort((left, right) => {
    const leftRoot = getRootTypeId(left, typeIds);
    const rightRoot = getRootTypeId(right, typeIds);
    return (
      leftRoot - rightRoot ||
      left.parentId - right.parentId ||
      left.sort - right.sort ||
      left.id - right.id
    );
  });
}

function getSpecialBehaviorMark(type: TypeRow): string {
  if (type.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.none) {
    return '';
  }
  const label = RECORD_TYPE_SPECIAL_BEHAVIOR.label(type.specialBehavior);
  if (!label) {
    return '';
  }

  const isAbsorption =
    type.specialBehavior === RECORD_TYPE_SPECIAL_BEHAVIOR.refundAbsorption ||
    type.specialBehavior ===
      RECORD_TYPE_SPECIAL_BEHAVIOR.reimbursementAbsorption;
  return isAbsorption ? `${label}，暂不支持` : label;
}

export function formatTypeDisplayName(
  type: TypeRow,
  hasChildren: boolean,
): string {
  const marks: string[] = [];
  if (hasChildren) {
    marks.push('父类');
  }
  const specialMark = getSpecialBehaviorMark(type);
  if (specialMark && specialMark !== type.name) {
    marks.push(specialMark);
  }

  return marks.length > 0 ? `${type.name}（${marks.join('；')}）` : type.name;
}

export function getParentTypeIds(types: readonly TypeRow[]): Set<number> {
  return new Set(
    types.filter(type => type.parentId !== 0).map(type => type.parentId),
  );
}
