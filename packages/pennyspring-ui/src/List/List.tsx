import React, { useRef } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import type {
  FlatListProps,
  ListRenderItemInfo,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { Loading } from '../Loading';
import { SwipeAction } from '../SwipeAction';
import { useControllableValue } from '../_hooks';
import { renderTextNode } from '../shares/node';
import type { ListItemData, ListProps, ListSectionData } from './types';

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

interface SectionEntry<ItemT> {
  kind: 'section';
  key: string;
  section: ListSectionData<ItemT>;
}

interface ItemEntry<ItemT> {
  kind: 'item';
  key: string;
  item: ItemT;
  indexInSection?: number;
  sectionItemCount?: number;
}

type ListEntry<ItemT> = SectionEntry<ItemT> | ItemEntry<ItemT>;

const useStyles = createUseSheetStyle(token => ({
  root: { backgroundColor: token.colorBgContainer },
  header: {
    paddingHorizontal: token.padding,
    paddingVertical: token.padding / 2,
    borderBottomWidth: token.lineWidth,
    borderColor: token.colorSplit,
  },
  footer: {
    paddingHorizontal: token.padding,
    paddingVertical: token.padding / 2,
    borderTopWidth: token.lineWidth,
    borderColor: token.colorSplit,
  },
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
  selectedMarker: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: token.lineWidthBold,
    backgroundColor: token.colorPrimary,
  },
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
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXS,
  },
  title: { flex: 1, minWidth: 0 },
  badge: {
    borderRadius: token.borderRadiusOuter,
    backgroundColor: token.colorFillQuaternary,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS / 2,
  },
  badgeText: { color: token.colorTextTertiary },
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
  right: { alignItems: 'flex-end', flexDirection: 'row', gap: token.marginXS },
  disclosure: { marginLeft: token.marginXXS },
  status: {
    borderRadius: token.borderRadiusOuter,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS / 2,
  },
  statusPrimary: { backgroundColor: token.colorPrimaryBg },
  statusSuccess: { backgroundColor: token.colorSuccessBg },
  statusWarning: { backgroundColor: token.colorWarningBg },
  statusError: { backgroundColor: token.colorErrorBg },
  statusText: { color: token.colorTextSecondary },
  statusPrimaryText: { color: token.colorPrimaryText },
  statusSuccessText: { color: token.colorSuccessText },
  statusWarningText: { color: token.colorWarningText },
  statusErrorText: { color: token.colorErrorText },
  metricGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginSM,
  },
  metric: { alignItems: 'flex-end', width: token.sizeXXL },
  metricValue: { color: token.colorText, fontVariant: ['tabular-nums'] },
  metricLabel: { color: token.colorTextTertiary },
}));

const TONE_STYLES = {
  default: { background: undefined, text: undefined },
  primary: { background: 'statusPrimary', text: 'statusPrimaryText' },
  success: { background: 'statusSuccess', text: 'statusSuccessText' },
  warning: { background: 'statusWarning', text: 'statusWarningText' },
  error: { background: 'statusError', text: 'statusErrorText' },
} as const;

function renderRow(
  item: ListItemData,
  styles: ReturnType<typeof useStyles>,
  showDivider: boolean,
  hasDisclosure = false,
) {
  const hasDescription =
    (item.description ?? item.descriptionText) !== undefined;
  const hasPlate = item.icon !== undefined || item.left !== undefined;
  const content = item.body ?? item.children ?? (
    <Column style={styles.content}>
      <Row align="center" style={styles.titleLine}>
        {renderTextNode(item.title ?? item.titleText, text => (
          <Text
            color={item.disabled ? 'tertiary' : 'default'}
            numberOfLines={1}
            size="sm"
            style={styles.title}
            weight="medium"
          >
            {text}
          </Text>
        ))}
        {item.badgeText ? (
          <View style={styles.badge}>
            <Text size="xs" style={styles.badgeText}>
              {item.badgeText}
            </Text>
          </View>
        ) : null}
      </Row>
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
  const rightNode =
    item.right !== undefined
      ? renderTextNode(item.right, text => (
          <Text color={item.disabled ? 'tertiary' : 'secondary'} size="sm">
            {text}
          </Text>
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
      {item.selected ? <View style={styles.selectedMarker} /> : null}
      {hasPlate ? (
        <View
          style={[styles.plate, item.disabled ? styles.plateDisabled : null]}
        >
          {item.icon !== undefined ? (
            <Icon
              color={item.disabled ? 'tertiary' : 'textSecondary'}
              icon={item.icon}
              size={20}
            />
          ) : (
            renderTextNode(item.left, text => <Text>{text}</Text>)
          )}
        </View>
      ) : null}
      {content}
      {item.metrics?.length ? (
        <Row style={styles.metricGroup}>
          {item.metrics.map(metric => {
            return (
              <Column key={metric.key} style={styles.metric}>
                {metric.label !== undefined ? (
                  <Text color="tertiary" size="xs" numberOfLines={1}>
                    {metric.label}
                  </Text>
                ) : null}
                {renderTextNode(metric.value, text => (
                  <Text
                    color={metric.tone ?? 'default'}
                    size="sm"
                    weight="medium"
                    style={styles.metricValue}
                    numberOfLines={1}
                  >
                    {text}
                  </Text>
                ))}
              </Column>
            );
          })}
        </Row>
      ) : null}
      {item.statusText !== undefined
        ? (() => {
            const tone = TONE_STYLES[item.statusTone ?? 'default'];
            return (
              <View
                style={[
                  styles.status,
                  tone.background ? styles[tone.background] : null,
                ]}
              >
                <Text
                  size="xs"
                  style={[
                    styles.statusText,
                    tone.text ? styles[tone.text] : null,
                  ]}
                >
                  {item.statusText}
                </Text>
              </View>
            );
          })()
        : null}
      {item.selected ? (
        <Icon
          color={item.disabled ? 'tertiary' : 'primary'}
          icon="check"
          size={CHECK_SIZE}
        />
      ) : null}
      <View style={styles.right}>
        {rightNode}
        {item.disclosure || hasDisclosure ? (
          <Icon
            color="tertiary"
            icon="caret-right"
            size={ARROW_SIZE}
            style={styles.disclosure}
          />
        ) : null}
      </View>
      {showDivider ? (
        <View
          style={[styles.divider, hasPlate ? null : styles.dividerTextOnly]}
        />
      ) : null}
    </Row>
  );

  if (
    (item.onPress !== undefined || item.onLongPress !== undefined) &&
    !item.disabled
  ) {
    return (
      <Pressable
        onLongPress={item.onLongPress}
        onPress={item.onPress}
        style={({ pressed }) => [
          item.style,
          pressed ? styles.itemPressed : null,
        ]}
      >
        {row}
      </Pressable>
    );
  }

  return <View style={item.style}>{row}</View>;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function ListInner<ItemT>({
  children,
  data,
  sections,
  renderItem,
  header,
  footer,
  empty,
  loading,
  loadingText = '加载中…',
  loadingIndicator,
  renderSwipeActions,
  size = 'normal',
  hasMore = true,
  isLoadingMore = false,
  onLoadMore,
  loadMoreThreshold = 0.1,
  completeText = '没有更多了',
  collapsible,
  title,
  titleText,
  open,
  defaultOpen,
  onOpenChange,
  onEndReached,
  onEndReachedThreshold,
  keyExtractor,
  style,
  styles: styleOverrides,
  contentContainerStyle,
  ...flatListProps
}: ListProps<ItemT>) {
  const styles = useStyles();
  const [isOpen, setOpen] = useControllableValue(
    defaultOpen ?? false,
    open,
    onOpenChange,
  );
  const [sectionOpenState, setSectionOpenState] = React.useState<
    Record<string, boolean>
  >({});
  const loadingMoreRef = useRef(false);
  const listData =
    collapsible && !isOpen
      ? []
      : (data ?? (children == null ? [] : [children as ItemT]));
  const sectionEntries: ListEntry<ItemT>[] | undefined =
    sections !== undefined
      ? sections.flatMap(section => {
          const sectionIsOpen =
            section.open ??
            sectionOpenState[section.key] ??
            section.defaultOpen ??
            true;
          const headerEntry: SectionEntry<ItemT> = {
            kind: 'section',
            key: `section-${section.key}`,
            section,
          };
          if (!sectionIsOpen) return [headerEntry];
          return [
            headerEntry,
            ...section.data.map((item, index): ItemEntry<ItemT> => ({
              kind: 'item',
              key: `${section.key}-${String(keyExtractor?.(item, index) ?? (item as ListItemData).value ?? index)}`,
              item,
              indexInSection: index,
              sectionItemCount: section.data.length,
            })),
          ];
        })
      : undefined;
  const entries = sectionEntries ?? listData;
  const mergedRenderItem = (entryInfo: ListRenderItemInfo<ItemT>) => {
    const entry =
      sectionEntries === undefined
        ? {
            kind: 'item' as const,
            key: String(
              keyExtractor?.(entryInfo.item, entryInfo.index) ??
                entryInfo.index,
            ),
            item: entryInfo.item,
          }
        : (entryInfo.item as unknown as ListEntry<ItemT>);
    if (entry.kind === 'section') {
      const section = entry.section;
      const isSectionOpen =
        section.open ??
        sectionOpenState[section.key] ??
        section.defaultOpen ??
        true;
      const onSectionPress = section.collapsible
        ? () => {
            const nextOpen = !isSectionOpen;
            setSectionOpenState(current => ({
              ...current,
              [section.key]: nextOpen,
            }));
            section.onOpenChange?.(nextOpen);
          }
        : undefined;
      return (
        <Pressable
          disabled={onSectionPress === undefined}
          onPress={onSectionPress}
          style={[styles.groupHeader, styleOverrides?.groupHeader]}
        >
          <Row align="center" style={styles.groupHeaderTitle} gap="small">
            {renderTextNode(section.title ?? section.titleText, text => (
              <Text color="tertiary" size="xs" weight="semibold">
                {text}
              </Text>
            ))}
            {section.countText !== undefined ? (
              <Text color="tertiary" size="xs">
                {section.countText}
              </Text>
            ) : null}
          </Row>
          {section.collapsible ? (
            <Icon
              color="tertiary"
              icon="caret-right"
              size={ARROW_SIZE}
              style={
                isSectionOpen
                  ? styles.groupHeaderChevronOpen
                  : styles.groupHeaderChevron
              }
            />
          ) : null}
        </Pressable>
      );
    }
    const item = entry.item;
    const itemInfo = {
      ...entryInfo,
      index: entry.indexInSection ?? entryInfo.index,
      item,
    } as ListRenderItemInfo<ItemT>;
    const row =
      entryInfo.item === children &&
      data === undefined &&
      sections === undefined ? (
        <>{children}</>
      ) : renderItem !== undefined ? (
        <>{renderItem(itemInfo)}</>
      ) : (
        <>
          {renderRow(
            item as unknown as ListItemData,
            styles,
            entry.indexInSection !== undefined
              ? entry.indexInSection < (entry.sectionItemCount ?? 0) - 1
              : entryInfo.index < entries.length - 1,
          )}
        </>
      );
    const actions = renderSwipeActions?.(itemInfo);

    if (
      actions === null ||
      actions === undefined ||
      (!actions.leftActions?.length && !actions.rightActions?.length)
    ) {
      return row;
    }

    return (
      <SwipeAction
        disabled={actions.disabled}
        leftActions={actions.leftActions}
        rightActions={actions.rightActions}
        size={size}
      >
        {row}
      </SwipeAction>
    );
  };
  const headerNode = (
    <>
      {header !== undefined ? (
        <Column style={[styles.header, styleOverrides?.header]}>
          {renderTextNode(header, text => (
            <Text color="secondary">{text}</Text>
          ))}
        </Column>
      ) : null}
      {collapsible ? (
        <Pressable
          hitSlop={6}
          onPress={() => setOpen(!isOpen)}
          style={[styles.groupHeader, styleOverrides?.groupHeader]}
        >
          <Column style={styles.groupHeaderTitle}>
            {renderTextNode(title ?? titleText, text => (
              <Text color="tertiary" size="xs" weight="semibold">
                {text}
              </Text>
            ))}
          </Column>
          <Icon
            color="tertiary"
            icon="caret-right"
            size={ARROW_SIZE}
            style={
              isOpen ? styles.groupHeaderChevronOpen : styles.groupHeaderChevron
            }
          />
        </Pressable>
      ) : null}
    </>
  );
  const footerNode = (
    <>
      {loading || isLoadingMore ? (
        loadingIndicator === undefined ? (
          <Loading size="small" text={loadingText} variant="more" />
        ) : (
          <Column style={[styles.loading, styleOverrides?.loading]}>
            {renderTextNode(loadingIndicator, text => (
              <Text color="secondary">{text}</Text>
            ))}
          </Column>
        )
      ) : null}
      {!hasMore && !loading && !isLoadingMore ? (
        <Column style={[styles.footer, styleOverrides?.footer]}>
          <Text color="tertiary">{completeText}</Text>
        </Column>
      ) : null}
      {footer !== undefined ? (
        <Column style={[styles.footer, styleOverrides?.footer]}>
          {renderTextNode(footer, text => (
            <Text color="secondary">{text}</Text>
          ))}
        </Column>
      ) : null}
    </>
  );
  const emptyNode =
    empty === undefined ? null : (
      <Column style={[styles.empty, styleOverrides?.empty]}>
        {renderTextNode(empty, text => (
          <Text color="description">{text}</Text>
        ))}
      </Column>
    );
  const handleEndReached: NonNullable<
    FlatListProps<ItemT>['onEndReached']
  > = info => {
    onEndReached?.(info);
    if (
      !hasMore ||
      isLoadingMore ||
      loadingMoreRef.current ||
      onLoadMore === undefined
    )
      return;
    loadingMoreRef.current = true;
    try {
      const result = onLoadMore();
      if (isPromiseLike(result)) {
        Promise.resolve(result)
          .finally(() => {
            loadingMoreRef.current = false;
          })
          .catch(() => undefined);
      } else loadingMoreRef.current = false;
    } catch (error) {
      loadingMoreRef.current = false;
      throw error;
    }
  };
  return (
    <FlatList<ItemT>
      {...flatListProps}
      scrollEnabled={flatListProps.scrollEnabled ?? false}
      data={[...entries] as ItemT[]}
      renderItem={mergedRenderItem}
      keyExtractor={
        sectionEntries === undefined
          ? (keyExtractor ?? ((_, index) => String(index)))
          : entry => (entry as unknown as ListEntry<ItemT>).key
      }
      ListHeaderComponent={headerNode}
      ListFooterComponent={footerNode}
      ListEmptyComponent={emptyNode}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold ?? loadMoreThreshold}
      style={[styles.root, style] as StyleProp<ViewStyle>}
      contentContainerStyle={[contentContainerStyle, styleOverrides?.content]}
    />
  );
}

export const List = ListInner as <ItemT = ListItemData>(
  props: ListProps<ItemT>,
) => React.ReactElement;
