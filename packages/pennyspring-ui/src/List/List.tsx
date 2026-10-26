import React, { useRef } from 'react';
import { FlatList, Pressable } from 'react-native';
import type { FlatListProps, ListRenderItemInfo, StyleProp, ViewStyle } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { renderTextNode } from '../shares/node';
import type { ListItemData, ListProps } from './types';

const useStyles = createUseSheetStyle(token => ({
  root: { backgroundColor: token.colorBgContainer },
  header: { paddingHorizontal: token.padding, paddingVertical: token.padding / 2, borderBottomWidth: token.lineWidth, borderColor: token.colorSplit },
  footer: { paddingHorizontal: token.padding, paddingVertical: token.padding / 2, borderTopWidth: token.lineWidth, borderColor: token.colorSplit },
  empty: { alignItems: 'center', padding: token.paddingLG },
  loading: { alignItems: 'center', padding: token.paddingSM },
  groupHeader: { minHeight: token.controlHeight, justifyContent: 'center', paddingHorizontal: token.paddingMD, backgroundColor: token.colorFillAlter },
  groupHeaderTitle: { flex: 1 },
  item: { minHeight: token.controlHeight, flexDirection: 'row', alignItems: 'center', gap: token.marginSM, paddingHorizontal: token.paddingMD, paddingVertical: token.paddingMD / 2, borderBottomWidth: token.lineWidth, borderColor: token.colorSplit },
  itemPressed: { backgroundColor: token.colorBgTextHover },
  itemDisabled: { opacity: token.opacityLoading },
  content: { flex: 1 },
  description: { marginTop: token.marginXXS },
}));

function renderRow(item: ListItemData, styles: ReturnType<typeof useStyles>) {
  const content = item.children ?? <Column style={styles.content}>
    {renderTextNode(item.title ?? item.titleText, text => <Text color={item.disabled ? 'disabled' : 'heading'}>{text}</Text>)}
    {renderTextNode(item.description ?? item.descriptionText, text => <Text color="description" size="sm" style={styles.description}>{text}</Text>)}
  </Column>;
  const row = <Row align="center" style={styles.item}>
    {item.left ? renderTextNode(item.left, text => <Text>{text}</Text>) : null}
    {content}
    {item.right ? renderTextNode(item.right, text => <Text>{text}</Text>) : null}
  </Row>;
  if (item.onPress && !item.disabled) {
    return <Pressable onPress={item.onPress} style={({ pressed }) => [pressed ? styles.itemPressed : null, item.style]}>{row}</Pressable>;
  }
  return <Column style={[item.disabled ? styles.itemDisabled : null, item.style]}>{row}</Column>;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return typeof value === 'object' && value !== null && 'then' in value && typeof value.then === 'function';
}

function ListInner<ItemT>({
  children, data, renderItem, header, footer, empty, loading, loadingText = '加载中…', loadingContent,
  hasMore = true, isLoadingMore = false, onLoadMore, loadMoreThreshold = 0.1, completeText = '没有更多了',
  collapsible, title, titleText, open, defaultOpen, onOpenChange, onEndReached, onEndReachedThreshold,
  keyExtractor, style, styles: styleOverrides, contentContainerStyle, ...flatListProps
}: ListProps<ItemT>) {
  const styles = useStyles();
  const [isOpen, setOpen] = useControllableValue(defaultOpen ?? false, open, onOpenChange);
  const loadingMoreRef = useRef(false);
  const listData = collapsible && !isOpen ? [] : data ?? (children == null ? [] : [children as ItemT]);
  const mergedRenderItem = (info: ListRenderItemInfo<ItemT>) => {
    if (info.item === children && data === undefined) return <>{children}</>;
    if (renderItem !== undefined) return <>{renderItem(info)}</>;
    return <>{renderRow(info.item as unknown as ListItemData, styles)}</>;
  };
  const headerNode = <>
    {header !== undefined ? <Column style={[styles.header, styleOverrides?.header]}>{renderTextNode(header, text => <Text color="secondary">{text}</Text>)}</Column> : null}
    {collapsible ? <Pressable onPress={() => setOpen(!isOpen)} style={[styles.groupHeader, styleOverrides?.groupHeader]}>
      <Row align="center" justify="between"><Column style={styles.groupHeaderTitle}>{renderTextNode(title ?? titleText, text => <Text weight="strong">{text}</Text>)}</Column><Text color="tertiary">{isOpen ? '⌄' : '›'}</Text></Row>
    </Pressable> : null}
  </>;
  const footerNode = <>
    {loading || isLoadingMore ? <Column style={[styles.loading, styleOverrides?.loading]}>{renderTextNode(loadingContent ?? loadingText, text => <Text color="secondary">{text}</Text>)}</Column> : null}
    {!hasMore && !loading && !isLoadingMore ? <Column style={[styles.footer, styleOverrides?.footer]}><Text color="tertiary">{completeText}</Text></Column> : null}
    {footer !== undefined ? <Column style={[styles.footer, styleOverrides?.footer]}>{renderTextNode(footer, text => <Text color="secondary">{text}</Text>)}</Column> : null}
  </>;
  const emptyNode = empty === undefined ? null : <Column style={[styles.empty, styleOverrides?.empty]}>{renderTextNode(empty, text => <Text color="description">{text}</Text>)}</Column>;
  const handleEndReached: NonNullable<FlatListProps<ItemT>['onEndReached']> = info => {
    onEndReached?.(info);
    if (!hasMore || isLoadingMore || loadingMoreRef.current || onLoadMore === undefined) return;
    loadingMoreRef.current = true;
    try {
      const result = onLoadMore();
      if (isPromiseLike(result)) {
        Promise.resolve(result)
          .finally(() => { loadingMoreRef.current = false; })
          .catch(() => undefined);
      }
      else loadingMoreRef.current = false;
    } catch (error) {
      loadingMoreRef.current = false;
      throw error;
    }
  };
  return <FlatList<ItemT>
    {...flatListProps}
    data={[...listData]}
    renderItem={mergedRenderItem}
    keyExtractor={keyExtractor ?? ((_, index) => String(index))}
    ListHeaderComponent={headerNode}
    ListFooterComponent={footerNode}
    ListEmptyComponent={emptyNode}
    onEndReached={handleEndReached}
    onEndReachedThreshold={onEndReachedThreshold ?? loadMoreThreshold}
    style={[styles.root, style] as StyleProp<ViewStyle>}
    contentContainerStyle={[contentContainerStyle, styleOverrides?.content]}
  />;
}

export const List = ListInner as <ItemT = ListItemData>(props: ListProps<ItemT>) => React.ReactElement;
