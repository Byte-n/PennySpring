import { parseMarkdown } from '../../src/component/markdown/parser';
import type {
  MarkdownBlock,
  MarkdownInline,
} from '../../src/component/markdown/types';

function joinText(tokens: readonly MarkdownInline[]): string {
  return tokens
    .map(token => {
      if (token.type === 'text') {
        return token.value;
      }
      if (token.type === 'code') {
        return token.value;
      }
      if (token.type === 'link') {
        return joinText(token.children);
      }
      return joinText(token.children);
    })
    .join('');
}

function joinBlocks(blocks: readonly MarkdownBlock[]): string {
  return blocks
    .map(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return joinText(block.children);
      }
      if (block.type === 'code_block') {
        return block.value;
      }
      if (block.type === 'list') {
        return block.items.map(item => joinBlocks(item.children)).join(' ');
      }
      if (block.type === 'blockquote') {
        return joinBlocks(block.children);
      }
      if (block.type === 'table') {
        return block.rows.map(row => row.map(joinText).join('|')).join(' ');
      }
      return '';
    })
    .join(' ');
}

function blockValue(block: MarkdownBlock | undefined): unknown {
  if (!block || block.type !== 'paragraph') {
    return undefined;
  }
  return joinText(block.children);
}

describe('parseMarkdown', () => {
  it('reads leading hashes as heading levels and keeps inline content', () => {
    const tokens = parseMarkdown('### 本月支出 **汇总**');

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ level: 3 });
    expect(
      joinText(
        (tokens[0] as Extract<MarkdownBlock, { type: 'heading' }>).children,
      ),
    ).toBe('本月支出 汇总');
  });

  it('joins consecutive lines into one paragraph and treats blank lines as block breaks', () => {
    const tokens = parseMarkdown('转账记录\n还在整理\n\n下一段');

    const paragraphs = tokens.filter(token => token.type === 'paragraph');
    expect(paragraphs).toHaveLength(2);
    expect(blockValue(paragraphs[0])).toBe('转账记录 还在整理');
    expect(blockValue(paragraphs[1])).toBe('下一段');
  });

  it('renders emphasis markers as styling instead of literal characters', () => {
    const [paragraph] = parseMarkdown('**餐饮** 与 *娱乐* 的占比');

    expect(paragraph).toMatchObject({
      type: 'paragraph',
      children: [
        { type: 'strong', children: [{ type: 'text', value: '餐饮' }] },
        { type: 'text', value: ' 与 ' },
        { type: 'em', children: [{ type: 'text', value: '娱乐' }] },
        { type: 'text', value: ' 的占比' },
      ],
    });
  });

  it('treats paired tildes as strikethrough', () => {
    const [paragraph] = parseMarkdown('~~已删除~~ 记录');

    expect(
      (paragraph as Extract<MarkdownBlock, { type: 'paragraph' }>).children[0],
    ).toMatchObject({
      type: 'del',
      children: [{ type: 'text', value: '已删除' }],
    });
  });

  it('keeps inline code verbatim without parsing emphasis inside', () => {
    const [paragraph] = parseMarkdown('金额 `**120.00**` 元');

    expect(
      (paragraph as Extract<MarkdownBlock, { type: 'paragraph' }>).children,
    ).toContainEqual({
      type: 'code',
      value: '**120.00**',
    });
  });

  it('keeps an unpaired backtick as literal text instead of swallowing the line', () => {
    const [paragraph] = parseMarkdown('` 号 *娱乐*');

    expect(
      joinText(
        (paragraph as Extract<MarkdownBlock, { type: 'paragraph' }>).children,
      ),
    ).toBe('` 号 娱乐');
  });

  it('prefers a link over an emphasis marker when brackets and parentheses pair up', () => {
    const [paragraph] = parseMarkdown(
      '账单明细 [明细页](https://example.com/bill) *备注*',
    );

    const children = (
      paragraph as Extract<MarkdownBlock, { type: 'paragraph' }>
    ).children;
    expect(children).toContainEqual({
      type: 'link',
      href: 'https://example.com/bill',
      children: [{ type: 'text', value: '明细页' }],
    });
    expect(children).toContainEqual({
      type: 'em',
      children: [{ type: 'text', value: '备注' }],
    });
    expect(joinText(children)).toBe('账单明细 明细页 备注');
  });

  it('drops the image label brackets but keeps its alt text as plain text', () => {
    const [paragraph] = parseMarkdown('![收据](https://example.com/a.png)');

    expect(
      joinText(
        (paragraph as Extract<MarkdownBlock, { type: 'paragraph' }>).children,
      ),
    ).toBe('收据');
  });

  it('keeps fence content untouched and records the language', () => {
    const tokens = parseMarkdown(
      '```json\n{"total": **120**}\n```\n\n后续说明',
    );

    expect(tokens[0]).toMatchObject({
      type: 'code_block',
      lang: 'json',
      value: '{"total": **120**}',
    });
    expect(blockValue(tokens[1])).toBe('后续说明');
  });

  it('treats an unclosed fence as complete so streamed text never leaks markers', () => {
    const tokens = parseMarkdown('```sql\nSELECT 1');

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toMatchObject({ type: 'code_block', value: 'SELECT 1' });
  });

  it('parses list items and follows the ordered marker start number', () => {
    const tokens = parseMarkdown('3. 餐饮\n4. 交通');

    expect(tokens[0]).toMatchObject({ type: 'list', ordered: true, start: 3 });
    const list = tokens[0] as Extract<MarkdownBlock, { type: 'list' }>;
    expect(list.items.map(item => joinBlocks(item.children))).toEqual([
      '餐饮',
      '交通',
    ]);
  });

  it('nests indented list items under the preceding item', () => {
    const tokens = parseMarkdown('- 餐饮\n  - 火锅\n  - 咖啡\n- 交通');

    const list = tokens[0] as Extract<MarkdownBlock, { type: 'list' }>;
    expect(list.items).toHaveLength(2);
    const nested = list.items[0].children.find(
      child => child.type === 'list',
    ) as Extract<MarkdownBlock, { type: 'list' }>;
    expect(nested.items.map(item => joinBlocks(item.children))).toEqual([
      '火锅',
      '咖啡',
    ]);
  });

  it('parses blockquote content as blocks without the marker', () => {
    const tokens = parseMarkdown('> **提示**：先选月份\n> 再选类型');

    const quote = tokens[0] as Extract<MarkdownBlock, { type: 'blockquote' }>;
    expect(tokens[0]).toMatchObject({ type: 'blockquote' });
    expect(
      joinText(
        (quote.children[0] as Extract<MarkdownBlock, { type: 'paragraph' }>)
          .children,
      ),
    ).toBe('提示：先选月份 再选类型');
  });

  it('recognises a pipe table with header, separator and body rows', () => {
    const tokens = parseMarkdown(
      '| 类型 | 金额 |\n| --- | --- |\n| 餐饮 | 120 |',
    );

    const table = tokens[0] as Extract<MarkdownBlock, { type: 'table' }>;
    expect(tokens[0]).toMatchObject({ type: 'table' });
    expect(table.rows.map(row => row.map(cell => joinText(cell)))).toEqual([
      ['类型', '金额'],
      ['餐饮', '120'],
    ]);
  });

  it('does not treat a lone pipe line as a table', () => {
    const tokens = parseMarkdown('合计 | 120\n\n下一段');

    expect(tokens[0]).toMatchObject({ type: 'paragraph' });
    expect(blockValue(tokens[0])).toBe('合计 | 120');
  });

  it('reads marker-only lines as a horizontal rule', () => {
    const tokens = parseMarkdown('前一段\n\n---\n\n后一段');

    expect(tokens).toHaveLength(3);
    expect(tokens[1]).toMatchObject({ type: 'hr' });
  });

  it('ignores escaped markers so they show as literal characters', () => {
    const [paragraph] = parseMarkdown('节省 \\*注意\\* 金额');

    expect(
      joinText(
        (paragraph as Extract<MarkdownBlock, { type: 'paragraph' }>).children,
      ),
    ).toBe('节省 *注意* 金额');
  });
});
