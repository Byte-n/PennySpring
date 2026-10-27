import React, { useRef } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import type { FlatListProps, ListRenderItemInfo, StyleProp, ViewStyle } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { Loading } from '../Loading';
import { useControllableValue } from '../_hooks';
import { renderTextNode } from '../shares/node';
import type { ListItemData, ListProps } from './types';
import type { ListAmount } from './types';

/** 行高 / 底板 / 分隔线内缩在 AliasToken 中没有档位，按设计稿落为语义常量。 */
const PLATE_SIZE = 38;
const PLATE_RADIUS = 12;
const SINGLE_ROW_HEIGHT = 56;
const TWO_LINE_ROW_HEIGHT = 64;
const ROW_GAP = 12;
const ROW_PADDING_HORIZONTAL = 16;
const DIVIDER_INSET = ROW_PADDING_HORIZONTAL + PLATE_SIZE + ROW_GAP;
const DIVIDER_INSET_TEXT_ONLY = ROW_PADDING_HORIZONTAL;
const GROUP_HEADER_HEIGHT = 32;
const CHECK_SIZE = 18;
const ARROW_SIZE = 16;

const useStyles = createUseSheetStyle(token => ({
  root: { backgroundColor: token.colorBgContainer },
  header: { paddingHorizontal: token.padding, paddingVertical: token.padding / 2, borderBottomWidth: token.lineWidth, borderColor: token.colorSplit },
  footer: { paddingHorizontal: token.padding, paddingVertical: token.padding / 2, borderTopWidth: token.lineWidth, borderColor: token.colorSplit },
  empty: { alignItems: 'center', padding: token.paddingLG },
  loading: { alignItems: 'center', padding: token.paddingSM },
  groupHeader: {
    minHeight: GROUP_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: token.marginXXS,
  },
  groupHeaderTitle: { flex: 1 },
  groupHeaderChevron: { transform: [{ rotate: '0deg' }] },
  groupHeaderChevronOpen: { transform: [{ rotate: '90deg' }] },
  item: {
    minHeight: SINGLE_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginSM,
    paddingHorizontal: token.padding,
    paddingVertical: token.marginXS,
  },
  itemTwoLine: { minHeight: TWO_LINE_ROW_HEIGHT },
  itemSelected: { backgroundColor: token.colorPrimaryBg },
  itemPressed: { backgroundColor: token.colorFillTertiary },
  itemDisabled: {},
  plate: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: PLATE_RADIUS,
    height: PLATE_SIZE,
    justifyContent: 'center',
    width: PLATE_SIZE,
  },
  plateDisabled: { backgroundColor: token.colorFillQuaternary },
  content: { flex: 1 },
  description: { marginTop: token.marginXXS / 2 },
  divider: {
    position: 'absolute',
    left: DIVIDER_INSET,
    right: 0,
    top: 0,
    height: token.lineWidth,
    backgroundColor: token.colorSplit,
  },
  dividerTextOnly: { left: DIVIDER_INSET_TEXT_ONLY },
  amount: { alignItems: 'baseline' },
  amountAffix: { opacity: 0.55 },
  amountInteger: { fontVariant: ['tabular-nums'] },
  amountDecimal: { opacity: 0.72 },
  right: { alignItems: 'flex-end', flexDirection: 'row', gap: token.marginXS },
}));

const AMOUNT_TONE_COLOR = {
  expense: 'errorText',
  income: 'successText',
  neutral: 'default',
} as const;

function formatAmount(value: number | string): { decimal: string; integer: string } {
  if (typeof value === 'number') {
    const fixed = value.toFixed(2);
    const [integer, decimal = '00'] = fixed.split('.');

    return { decimal, integer: Number(integer).toLocaleString('en-US') };
  }

  const matched = value.match(/^(-?)([\d,]+)(?:\.(\d+))?$/);

  if (matched === null) {
    return { decimal: '', integer: value };
  }

  return {
    decimal: matched[3] ?? '00',
    integer: `${matched[1]}${Number(matched[2].replace(/,/g, '')).toLocaleString('en-US')}`,
  };
}

function renderAmount(
  amount: ListAmount,
  styles: ReturnType<typeof useStyles>,
  disabled: boolean,
) {
  const tone = amount.tone ?? 'neutral';
  const color = disabled ? 'tertiary' : AMOUNT_TONE_COLOR[tone];
  const { decimal, integer } = formatAmount(amount.value);
  const currency = amount.currency ?? '¥';
  const sign = tone === 'income' ? '+' : '';

  return (
    <Row align="baseline" style={styles.amount}>
      <Text color={color} size="xs" style={styles.amountAffix} weight="medium">
        {`${sign}${currency}`}
      </Text>
      <Text color={color} size="md" style={styles.amountInteger} weight="semibold">
        {integer}
      </Text>
      {decimal === '' ? null : (
        <Text color={color} size="xs" style={styles.amountDecimal} weight="medium">
          {`.${decimal}`}
        </Text>
      )}
    </Row>
  );
}

function renderRow(
  item: ListItemData,
  styles: ReturnType<typeof useStyles>,
  showDivider: boolean,
) {
  const hasDescription = (item.description ?? item.descriptionText) !== undefined;
  const hasPlate = item.icon !== undefined || item.left !== undefined;
  const content = item.children ?? (
    <Column gap={0} style={styles.content}>
      {renderTextNode(item.title ?? item.titleText, text => (
        <Text
          color={item.disabled ? 'tertiary' : 'default'}
          numberOfLines={1}
          size="sm"
          weight="medium"
        >
          {text}
        </Text>
      ))}
      {renderTextNode(item.description ?? item.descriptionText, text => (
        <Text
          color="tertiary"
          numberOfLines={1}
          size="xs"
          style={styles.description}
        >
          {text}
        </Text>
      ))}
    </Column>
  );
  const amountNode = item.amountText !== undefined
    ? renderAmount(item.amountText, styles, item.disabled === true)
    : null;
  const rightNode = item.right !== undefined
    ? renderTextNode(item.right, text => (
      <Text color={item.disabled ? 'tertiary' : 'secondary'} size="sm">{text}</Text>
    ))
    : null;
  const row = (
    <Row
      align="center"
      style={[
        styles.item,
        hasDescription ? styles.itemTwoLine : null,
        item.selected ? styles.itemSelected : null,
        item.disabled ? styles.itemDisabled : null,
      ]}
    >
      {hasPlate ? (
        <View style={[styles.plate, item.disabled ? styles.plateDisabled : null]}>
          {item.icon !== undefined
            ? <Icon color={item.disabled ? 'tertiary' : 'textSecondary'} icon={item.icon} size={20} />
            : renderTextNode(item.left, text => <Text>{text}</Text>)}
        </View>
      ) : null}
      {content}
      {item.selected ? (
        <Icon color={item.disabled ? 'tertiary' : 'primary'} icon="check" size={CHECK_SIZE} />
      ) : (
        <View style={styles.right}>{amountNode}{rightNode}</View>
      )}
      {showDivider ? (
        <View style={[styles.divider, hasPlate ? null : styles.dividerTextOnly]} />
      ) : null}
    </Row>
  );

  if (item.onPress !== undefined && !item.disabled) {
    return (
      <Pressable
        onPress={item.onPress}
        style={({ pressed }) => [item.style, pressed ? styles.itemPressed : null]}
      >
        {row}
      </Pressable>
    );
  }

  return <View style={item.style}>{row}</View>;
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
    return (
      <>
        {renderRow(
          info.item as unknown as ListItemData,
          styles,
          info.index < listData.length - 1,
        )}
      </>
    );
  };
  const headerNode = <>
    {header !== undefined ? <Column style={[styles.header, styleOverrides?.header]}>{renderTextNode(header, text => <Text color="secondary">{text}</Text>)}</Column> : null}
    {collapsible ? (
      <Pressable
        hitSlop={6}
        onPress={() => setOpen(!isOpen)}
        style={[styles.groupHeader, styleOverrides?.groupHeader]}
      >
        <Column style={styles.groupHeaderTitle}>
          {renderTextNode(title ?? titleText, text => (
            <Text color="tertiary" size="xs" weight="semibold">{text}</Text>
          ))}
        </Column>
        <Icon
          color="tertiary"
          icon="caret-right"
          size={ARROW_SIZE}
          style={isOpen ? styles.groupHeaderChevronOpen : styles.groupHeaderChevron}
        />
      </Pressable>
    ) : null}
  </>;
  const footerNode = <>
    {loading || isLoadingMore ? (
      loadingContent === undefined
        ? <Loading size="small" text={loadingText} variant="more" />
        : <Column style={[styles.loading, styleOverrides?.loading]}>{renderTextNode(loadingContent, text => <Text color="secondary">{text}</Text>)}</Column>
    ) : null}
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
