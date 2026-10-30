import React, { Fragment, useMemo } from 'react';
import { Linking } from 'react-native';
import { Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import { parseMarkdown } from './markdown/parser';
import type { MarkdownBlock, MarkdownInline } from './markdown/types';
import type { TextSize } from '@pennyspring/ui';

const BULLET_TEXT = '• ';
const LINK_SCHEMES = ['http://', 'https://'];

const useStyles = createUseSheetStyle(token => ({
  codeBlock: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadiusSM,
    fontFamily: token.fontFamilyCode,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
  },
  codeSpan: {
    fontFamily: token.fontFamilyCode,
  },
  del: {
    textDecorationLine: 'line-through',
  },
  quote: {
    borderLeftColor: token.colorBorderSecondary,
    borderLeftWidth: token.lineWidthBold,
    paddingStart: token.paddingXS,
  },
  rule: {
    backgroundColor: token.colorBorderSecondary,
    height: token.lineWidthBold,
    width: '100%',
  },
  tableCell: {
    flex: 1,
  },
}));

function headingSizeOf(level: number): TextSize {
  if (level === 1) {
    return 'h1';
  }
  if (level === 2) {
    return 'h2';
  }
  if (level === 3) {
    return 'h3';
  }
  return 'h4';
}

function isSafeLink(href: string): boolean {
  return LINK_SCHEMES.some(scheme => href.startsWith(scheme));
}

function openLink(href: string): void {
  if (isSafeLink(href)) {
    Linking.openURL(href).catch(() => undefined);
  }
}

function flattenBlocks(blocks: readonly MarkdownBlock[]): string {
  return blocks
    .map(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return flattenInline(block.children);
      }
      if (block.type === 'code_block') {
        return block.value;
      }
      if (block.type === 'list') {
        return block.items.map(item => flattenBlocks(item.children)).join(' ');
      }
      if (block.type === 'blockquote') {
        return flattenBlocks(block.children);
      }
      if (block.type === 'table') {
        return block.rows
          .map(row => row.map(cell => flattenInline(cell)).join(' | '))
          .join('\n');
      }
      return '';
    })
    .join(' ');
}

function flattenInline(tokens: readonly MarkdownInline[]): string {
  return tokens
    .map(token => {
      if (token.type === 'text' || token.type === 'code') {
        return token.value;
      }
      return flattenInline(token.children);
    })
    .join('');
}

export interface MarkdownTextProps {
  content: string;
  baseSize?: TextSize;
  selectable?: boolean;
}

export function MarkdownText({
  content,
  baseSize = 'sm',
  selectable = false,
}: MarkdownTextProps): React.ReactElement | null {
  const { token: themeToken } = useTheme();
  const styles = useStyles();
  const blocks = useMemo(() => parseMarkdown(content), [content]);

  if (!blocks.length) {
    return null;
  }

  const renderInline = (
    tokens: readonly MarkdownInline[],
    keyPrefix: string,
  ): React.ReactNode[] =>
    tokens.map((token, index) => {
      const key = `${keyPrefix}-${index}`;

      if (token.type === 'text') {
        return <Fragment key={key}>{token.value}</Fragment>;
      }

      if (token.type === 'code') {
        return (
          <Text key={key} selectable={selectable} style={styles.codeSpan}>
            {token.value}
          </Text>
        );
      }

      if (token.type === 'link') {
        return (
          <Text
            color="link"
            key={key}
            onPress={() => openLink(token.href)}
            selectable={selectable}
            testID="markdown-link"
          >
            {renderInline(token.children, key)}
          </Text>
        );
      }

      if (token.type === 'del') {
        return (
          <Text key={key} selectable={selectable} style={styles.del}>
            {renderInline(token.children, key)}
          </Text>
        );
      }

      return (
        <Text
          key={key}
          selectable={selectable}
          weight={token.type === 'strong' ? 'semibold' : undefined}
        >
          {renderInline(token.children, key)}
        </Text>
      );
    });

  const renderBlocks = (
    items: readonly MarkdownBlock[],
    keyPrefix: string,
    firstLabel?: string,
  ): React.ReactNode =>
    items.map((block, index) =>
      renderBlock(block, `${keyPrefix}-${index}`, index === 0 ? firstLabel : undefined),
    );

  const renderBlock = (
    block: MarkdownBlock,
    key: string,
    inlineLabel?: string,
  ): React.ReactNode => {
    switch (block.type) {
      case 'heading':
        return (
          <Text
            key={key}
            selectable={selectable}
            size={headingSizeOf(block.level)}
            testID="markdown-heading"
            weight="semibold"
          >
            {renderInline(block.children, key)}
          </Text>
        );

      case 'paragraph':
        return (
          <Text key={key} selectable={selectable} size={baseSize}>
            {inlineLabel}
            {renderInline(block.children, key)}
          </Text>
        );

      case 'code_block':
        return (
          <Text key={key} selectable size={baseSize} style={styles.codeBlock} testID="markdown-code-block">
            {block.value}
          </Text>
        );

      case 'list':
        return (
          <Fragment key={key}>
            {block.items.map((item, itemIndex) => {
              const itemKey = `${key}-${itemIndex}`;
              const label = item.number === null ? BULLET_TEXT : `${item.number}. `;
              return renderBlocks(item.children, itemKey, label);
            })}
          </Fragment>
        );

      case 'blockquote':
        return (
          <Column key={key} style={styles.quote}>
            <Text key={`${key}-text`} selectable={selectable} size={baseSize} color="secondary">
              {flattenBlocks(block.children)}
            </Text>
          </Column>
        );

      case 'table':
        return (
          <Column key={key} testID="markdown-table" gap={themeToken.marginXXS}>
            {block.rows.map((cells, rowIndex) => (
              <Row key={`${key}-row-${rowIndex}`} gap="small">
                {cells.map((cell, cellIndex) => (
                  <Text
                    key={`${key}-cell-${cellIndex}`}
                    selectable={selectable}
                    size={baseSize}
                    style={styles.tableCell}
                    weight={rowIndex === 0 ? 'semibold' : undefined}
                  >
                    {renderInline(cell, `${key}-cell-${cellIndex}`)}
                  </Text>
                ))}
              </Row>
            ))}
          </Column>
        );

      case 'hr':
        return <Row key={key} style={styles.rule} testID="markdown-rule" />;

      default:
        return null;
    }
  };

  return (
    <Column gap="small">
      {renderBlocks(blocks, 'block')}
    </Column>
  );
}
