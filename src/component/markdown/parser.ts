import type {
  MarkdownBlock,
  MarkdownInline,
  MarkdownListItem,
} from './types';

const HEADING_PATTERN = /^(#{1,6})\s+(.*)$/;
const UNORDERED_ITEM_PATTERN = /^([-*+])\s+(.*)$/;
const ORDERED_ITEM_PATTERN = /^(\d{1,9})([.)])\s+(.*)$/;
const FENCE_PATTERN = /^\s*```(.*)$/;
const RULE_PATTERN = /^\s*([-*_])\s*(?:\1\s*){2,}$/;
const BLOCK_START_PATTERN =
  /^(?:\s*(?:#{1,6}\s|>|```|([-*+]|\d{1,9}[.)])\s)|\s*([-*_])\s*(?:\2\s*){2,}$)/;
const TABLE_SEPARATOR_PATTERN = /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** 行内解析按优先级匹配：转义符、代码段、链接图片、成对强调标记。 */
const INLINE_PATTERNS: { pattern: RegExp; build: (match: RegExpExecArray) => MarkdownInline | null }[] = [
  { pattern: /^\\([\\`*_~[\]()#+\-.!>])/, build: match => ({ type: 'text', value: match[1] }) },
  { pattern: /^(`+)([^`]+?)\1/, build: match => ({ type: 'code', value: match[2] }) },
  {
    pattern: /^\[([^\]]*)\]\(([^)\s]+)\)/,
    build: match => ({ type: 'link', href: match[2], children: parseInline(match[1]) }),
  },
  {
    pattern: /^!\[([^\]]*)\](?:\([^)]*\))?/,
    build: match => ({ type: 'text', value: match[1] }),
  },
  { pattern: /^(\*\*|__)(?=\S)([\s\S]*?\S)\1/, build: match => ({ type: 'strong', children: parseInline(match[2]) }) },
  { pattern: /^(~~)(?=\S)([\s\S]*?\S)\1/, build: match => ({ type: 'del', children: parseInline(match[2]) }) },
];

export function parseMarkdown(source: string): MarkdownBlock[] {
  return parseBlocks(source.replace(/\r\n/g, '\n').split('\n'));
}

export function parseInline(source: string): MarkdownInline[] {
  const tokens: MarkdownInline[] = [];
  let pending = '';
  let index = 0;

  const pushText = (): void => {
    if (pending) {
      tokens.push({ type: 'text', value: pending });
      pending = '';
    }
  };

  while (index < source.length) {
    const rest = source.slice(index);

    if (rest.startsWith('*') || rest.startsWith('_')) {
      const emphasis = parseEmphasis(rest);
      if (emphasis) {
        pushText();
        tokens.push(emphasis.token);
        index += emphasis.consumed;
        continue;
      }
    }

    const matched = INLINE_PATTERNS
      .map(({ pattern, build }) => {
        const match = pattern.exec(rest);
        return match ? { ...build(match)!, length: match[0].length } : null;
      })
      .find(token => token !== null);

    if (matched) {
      pushText();
      const { length, ...token } = matched;
      tokens.push(token as MarkdownInline);
      index += length;
      continue;
    }

    pending += source[index];
    index += 1;
  }

  pushText();
  return tokens;
}

function parseEmphasis(rest: string): { token: MarkdownInline; consumed: number } | null {
  const opener = matchEmphasisOpener(rest);
  if (!opener) {
    return null;
  }

  const content = rest.slice(opener.length);
  const closerIndex = findCloser(content, opener);
  if (closerIndex < 0) {
    return null;
  }

  const body = content.slice(0, closerIndex);
  if (isPairOpener(matchEmphasisOpener(body) ?? '')) {
    return null;
  }

  return {
    token: { type: emphasisTypeOf(opener), children: parseInline(body) },
    consumed: opener.length * 2 + body.length,
  };
}

function isPairOpener(opener: string): boolean {
  return ['**', '__', '~~'].includes(opener);
}

function matchEmphasisOpener(rest: string): string | null {
  const candidates = ['***', '___', '**', '__', '~~', '*', '_'];
  return candidates.find(candidate => rest.startsWith(candidate)) ?? null;
}

function emphasisTypeOf(opener: string): 'strong' | 'em' | 'del' {
  if (opener === '~~') {
    return 'del';
  }
  if (opener.length === 1) {
    return 'em';
  }
  return 'strong';
}

function findCloser(content: string, opener: string): number {
  const delimiter = opener[0];
  const isUnderscore = delimiter === '_';
  const isNonSpace = (char: string | undefined): boolean =>
    char !== undefined && !/\s/.test(char);
  const isWordChar = (char: string | undefined): boolean =>
    char !== undefined && /[\p{L}\p{N}]/u.test(char);
  let index = content.indexOf(opener);

  while (index >= 0) {
    const before = content[index - 1];
    const after = content[index + opener.length];
    const isFlankedBySameDelimiter = after === delimiter || before === delimiter;
    const isUnderscoreIntraWord = isUnderscore && isWordChar(after);

    if (isNonSpace(before) && !isFlankedBySameDelimiter && !isUnderscoreIntraWord) {
      return index;
    }
    index = content.indexOf(opener, index + 1);
  }

  return -1;
}

function parseBlocks(lines: string[]): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index].trim()) {
      index += 1;
      continue;
    }

    const fence = FENCE_PATTERN.exec(lines[index]);
    if (fence) {
      const end = findFenceEnd(lines, index);
      blocks.push({
        type: 'code_block',
        lang: fence[1].trim(),
        value: dedentCode(lines.slice(index + 1, end)),
      });
      index = end + 1;
      continue;
    }

    const heading = HEADING_PATTERN.exec(lines[index]);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    if (lines[index].trimStart().startsWith('>')) {
      const end = collectUntil(lines, index + 1, line => !line.trimStart().startsWith('>'));
      blocks.push({
        type: 'blockquote',
        children: parseBlocks(dedentQuote(lines.slice(index, end))),
      });
      index = end;
      continue;
    }

    if (RULE_PATTERN.test(lines[index])) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    const table = parseTable(lines, index);
    if (table) {
      blocks.push(table.block);
      index = table.nextIndex;
      continue;
    }

    if (UNORDERED_ITEM_PATTERN.test(lines[index]) || ORDERED_ITEM_PATTERN.test(lines[index])) {
      const list = parseList(lines, index);
      blocks.push(list.block);
      index = list.nextIndex;
      continue;
    }

    const end = collectUntil(lines, index + 1, isBlockStart);
    blocks.push({
      type: 'paragraph',
      children: parseInline(lines.slice(index, end).join(' ')),
    });
    index = end;
  }

  return blocks;
}

function isBlockStart(line: string): boolean {
  return !line.trim() || BLOCK_START_PATTERN.test(line);
}

function collectUntil(lines: string[], start: number, stop: (line: string) => boolean): number {
  let index = start;
  while (index < lines.length && !stop(lines[index])) {
    index += 1;
  }
  return index;
}

function findFenceEnd(lines: string[], start: number): number {
  const end = collectUntil(lines, start + 1, line => /^\s*```/.test(line));
  return Math.min(end, lines.length);
}

function dedentCode(lines: string[]): string {
  const indents = lines.filter(line => line.trim()).map(leadingIndentOf);
  const minIndent = indents.length ? Math.min(...indents) : 0;
  return lines.map(line => (line.trim() ? line.slice(minIndent) : '')).join('\n');
}

function leadingIndentOf(line: string): number {
  return line.length - line.trimStart().length;
}

function dedentQuote(lines: string[]): string[] {
  return lines.map(line => line.trimStart().replace(/^>\s?/, ''));
}

function parseList(lines: string[], start: number): { block: MarkdownBlock; nextIndex: number } {
  const baseIndent = leadingIndentOf(lines[start]);
  const ordered = ORDERED_ITEM_PATTERN.test(lines[start]);
  const items: MarkdownListItem[] = [];
  let index = start;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      const nextItem = peekNextItem(lines, index + 1, baseIndent);
      if (nextItem === null) {
        index += 1;
        break;
      }
      index = nextItem;
      continue;
    }

    if (leadingIndentOf(line) > baseIndent && items.length > 0) {
      index += 1;
      continue;
    }

    const item = parseListItem(line);
    if (!item || item.ordered !== ordered || leadingIndentOf(line) !== baseIndent) {
      break;
    }

    const contentEnd = collectItemContent(lines, index + 1, baseIndent);
    items.push({ number: item.number, children: parseBlocks(dedentItem(lines.slice(index, contentEnd))) });
    index = contentEnd;
  }

  return {
    block: { type: 'list', ordered, start: ordered ? (items[0]?.number ?? 1) : 1, items },
    nextIndex: index,
  };
}

function parseListItem(line: string): { number: number | null; ordered: boolean } | null {
  const unordered = UNORDERED_ITEM_PATTERN.exec(line);
  if (unordered) {
    return { number: null, ordered: false };
  }
  const ordered = ORDERED_ITEM_PATTERN.exec(line);
  if (ordered) {
    return { number: Number(ordered[1]), ordered: true };
  }
  return null;
}

function collectItemContent(lines: string[], start: number, baseIndent: number): number {
  let index = start;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      const nextItem = peekNextItem(lines, index + 1, baseIndent);
      if (nextItem === null) {
        return index + 1;
      }
      index = nextItem;
      continue;
    }

    const item = parseListItem(line);
    if (item && leadingIndentOf(line) <= baseIndent) {
      return index;
    }

    index += 1;
  }

  return lines.length;
}

function peekNextItem(lines: string[], from: number, baseIndent: number): number | null {
  let index = from;

  while (index < lines.length && !lines[index].trim()) {
    index += 1;
  }

  if (index >= lines.length || leadingIndentOf(lines[index]) > baseIndent) {
    return null;
  }

  return parseListItem(lines[index]) ? index : null;
}

function dedentItem(lines: string[]): string[] {
  const marker = lines[0].match(/^\s*(?:[-*+]|\d{1,9}[.)])\s+/);
  const offset = marker ? marker[0].length : 0;
  const content = lines[0].slice(offset);
  const rest = lines
    .slice(1)
    .map(line => line.slice(Math.min(offset, leadingIndentOf(line))));

  return [content, ...rest];
}

function parseTable(lines: string[], start: number): { block: MarkdownBlock; nextIndex: number } | null {
  const header = lines[start];
  const separator = lines[start + 1];
  if (separator === undefined || !header.includes('|') || !TABLE_SEPARATOR_PATTERN.test(separator)) {
    return null;
  }

  const width = splitTableCells(header).length;
  if (width === 0 || splitTableCells(separator).length !== width) {
    return null;
  }

  const rows = [splitTableCells(header).map(cell => parseInline(cell))];
  let index = start + 2;

  while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
    rows.push(splitTableCells(lines[index]).map(cell => parseInline(cell)));
    index += 1;
  }

  if (rows.length < 2) {
    return null;
  }

  return { block: { type: 'table', rows }, nextIndex: index };
}

function splitTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}
