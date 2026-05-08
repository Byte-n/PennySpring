import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { List } from '../List';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { ListGroupProps, ListGroupSize } from './types';

const DEFAULT_SIZE: ListGroupSize = 'normal';

interface ListGroupStyleOptions {
  size: ListGroupSize;
}

function getHeaderPadding(size: ListGroupSize, token: AliasToken) {
  if (size === 'small') {
    return token.paddingXS;
  }

  if (size === 'large') {
    return token.paddingMD;
  }

  return token.paddingSM;
}

const useListGroupStyles = createUseSheetStyle(
  (token, { size }: ListGroupStyleOptions) => {
    const headerPadding = getHeaderPadding(size, token);

    return {
      root: {
        backgroundColor: token.colorBgContainer,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: token.paddingMD,
        paddingVertical: headerPadding,
      },
      title: {
        flex: 1,
        color: token.colorTextHeading,
      },
      summary: {
        marginLeft: token.marginSM,
      },
      list: {
        backgroundColor: token.colorBgContainer,
      },
      footer: {
        paddingHorizontal: token.paddingMD,
        paddingVertical: token.paddingXS,
      },
      empty: {
        paddingHorizontal: token.paddingMD,
        paddingVertical: token.paddingLG,
      },
    };
  },
);

function resolveSize(size?: ListGroupSize): ListGroupSize {
  return size ?? DEFAULT_SIZE;
}

function isChildrenEmpty(children: ReactNode): boolean {
  return React.Children.toArray(children).length === 0;
}

function renderTextNode(node: ReactNode, style: StyleProp<TextStyle>) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return <Text style={style}>{node}</Text>;
  }

  return node;
}

export function ListGroup({
  children,
  divider,
  empty,
  footer,
  hideWhenEmpty,
  size,
  style,
  styles,
  summary,
  title,
}: ListGroupProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useListGroupStyles({ size: resolvedSize });
  const hasChildren = !isChildrenEmpty(children);

  if (!hasChildren && hideWhenEmpty) {
    return null;
  }

  return (
    <View style={[tokenStyles.root, style]}>
      {title || summary ? (
        <View style={[tokenStyles.header, styles?.header]}>
          {renderTextNode(title, [tokenStyles.title, styles?.title])}
          {summary ? (
            <View style={[tokenStyles.summary, styles?.summary]}>{summary}</View>
          ) : null}
        </View>
      ) : null}
      {hasChildren ? (
        <View style={[tokenStyles.list, styles?.list]}>
          <List divider={divider} size={resolvedSize}>{children}</List>
        </View>
      ) : empty ? (
        <View style={[tokenStyles.empty, styles?.empty]}>{empty}</View>
      ) : null}
      {footer ? (
        <View style={[tokenStyles.footer, styles?.footer]}>{footer}</View>
      ) : null}
    </View>
  );
}
