export interface MarkdownTextToken {
  type: 'text';
  value: string;
}

export interface MarkdownCodeToken {
  type: 'code';
  value: string;
}

export interface MarkdownEmphasisToken {
  type: 'strong' | 'em' | 'del';
  children: MarkdownInline[];
}

export interface MarkdownLinkToken {
  type: 'link';
  href: string;
  children: MarkdownInline[];
}

export type MarkdownInline =
  | MarkdownTextToken
  | MarkdownCodeToken
  | MarkdownEmphasisToken
  | MarkdownLinkToken;

export interface MarkdownHeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: MarkdownInline[];
}

export interface MarkdownParagraphBlock {
  type: 'paragraph';
  children: MarkdownInline[];
}

export interface MarkdownCodeBlock {
  type: 'code_block';
  lang: string;
  value: string;
}

export interface MarkdownListItem {
  number: number | null;
  children: MarkdownBlock[];
}

export interface MarkdownListBlock {
  type: 'list';
  ordered: boolean;
  start: number;
  items: MarkdownListItem[];
}

export interface MarkdownBlockquoteBlock {
  type: 'blockquote';
  children: MarkdownBlock[];
}

export interface MarkdownTableBlock {
  type: 'table';
  /** rows -> cells -> inline tokens，首行为表头。 */
  rows: MarkdownInline[][][];
}

export interface MarkdownRuleBlock {
  type: 'hr';
}

export type MarkdownBlock =
  | MarkdownHeadingBlock
  | MarkdownParagraphBlock
  | MarkdownCodeBlock
  | MarkdownListBlock
  | MarkdownBlockquoteBlock
  | MarkdownTableBlock
  | MarkdownRuleBlock;
