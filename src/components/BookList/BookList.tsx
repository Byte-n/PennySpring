import React from 'react';
import { Image, Pressable, View } from 'react-native';
import type { ImageStyle, StyleProp } from 'react-native';
import {
  Column,
  Empty,
  Icon,
  List,
  Row,
  Text,
  toNativeImageSource,
  type ListItemData,
} from '@pennyspring/ui';
import { BOOK_TYPE, type BookRow } from '@pennyspring/api';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { NetworkIcon } from 'phosphor-react-native';
import '../../utils/prototype';
import { resolveMediaSource } from '../../media/refs';
import { getBookKey } from '../../stores/bookStore';
import type { BookEntry, CurrentBookRef } from '../../stores/bookStore';
import {
  getServerToken,
  type NetworkBookRef,
} from '../../stores/networkBookStore';
import { ManageSkeleton } from '../ManageSkeleton';

export interface BookListItem {
  entry: BookEntry;
  ref: CurrentBookRef;
  networkRef?: NetworkBookRef;
  error?: string;
}

export interface BookListProps {
  mode: 'select' | 'manage';
  items: BookListItem[];
  loading?: boolean;
  currentBookRef: CurrentBookRef | null;
  onBookSelect?: (ref: CurrentBookRef, entry: BookEntry) => void;
  onBookEdit?: (book: BookRow) => void;
  onBookDelete?: (id: number) => void;
  onNetworkRemove?: (ref: NetworkBookRef) => void;
  onNetworkRetry?: (ref: NetworkBookRef) => void;
  onBookMenu?: (item: BookListItem) => void;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    flexGrow: 1,
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  list: {
    flex: 1,
  },
  metaLine: {
    paddingHorizontal: token.paddingXXS,
  },
  spine: {
    alignItems: 'center',
    backgroundColor: token.colorPrimaryBg,
    borderRadius: token.borderRadiusSM,
    height: token.controlHeightLG,
    justifyContent: 'center',
    overflow: 'hidden',
    width: token.controlHeightSM,
  },
  spineImage: {
    height: '100%',
    width: '100%',
  },
  spineNetwork: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    gap: token.marginXXS / 2,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  currentTag: {
    alignItems: 'center',
    backgroundColor: token.colorPrimaryBg,
    borderRadius: token.controlHeightXS,
    flexDirection: 'row',
    gap: token.marginXXS,
    height: token.controlHeightXS,
    paddingHorizontal: token.paddingXS,
  },
  listEnd: {
    paddingTop: token.paddingSM,
  },
  listHeader: {
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  listFooter: {
    borderTopWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
}));

function getItemKey(item: BookListItem): string {
  return item.entry.kind === BOOK_TYPE.remote
    ? `remote-${item.networkRef?.serverUrl ?? ''}-${item.entry.id}`
    : `local-${item.entry.id}`;
}

function getFirstCharacter(name: string): string {
  return Array.from(name)[0] ?? '账';
}

function formatCreatedAt(time: number): string {
  if (!Number.isFinite(time) || time <= 0) {
    return '创建时间未知';
  }

  return `创建于 ${time.formatDateBy('YYYY-MM-DD')}`;
}

function BookSpine({ item }: { item: BookListItem }) {
  const styles = useStyles();
  const { entry } = item;
  const isRemote = entry.kind === BOOK_TYPE.remote;

  if (entry.background) {
    const serverUrl = item.networkRef?.serverUrl;
    const source =
      isRemote && serverUrl
        ? resolveMediaSource(
            entry.background,
            serverUrl,
            getServerToken(serverUrl),
          )
        : { uri: entry.background };
    return (
      <View style={styles.spine}>
        <Image
          resizeMode="cover"
          source={toNativeImageSource(source)}
          style={styles.spineImage as StyleProp<ImageStyle>}
        />
      </View>
    );
  }

  if (isRemote) {
    return (
      <View style={styles.spine}>
        <View style={styles.spineNetwork}>
          <Icon color="secondary" icon={NetworkIcon} size="normal" />
          <Text color="tertiary" size="xs">
            网络
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.spine}>
      <Text color="primaryText" weight="semibold" size="lg">
        {getFirstCharacter(entry.name)}
      </Text>
    </View>
  );
}

export function BookList({
  mode,
  items,
  loading = false,
  currentBookRef,
  onBookSelect,
  onBookEdit,
  onBookDelete,
  onNetworkRemove,
  onNetworkRetry,
  onBookMenu,
}: BookListProps) {
  const { token } = useTheme();
  const styles = useStyles();

  if (loading && items.length === 0) {
    return (
      <List
        data={[0]}
        contentContainerStyle={styles.content}
        renderItem={() => <ManageSkeleton rows={4} />}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    );
  }

  if (items.length === 0) {
    return (
      <Empty
        titleText="还没有账本"
        descriptionText="点右上角 + 新建或导入一个账本。"
      />
    );
  }

  const localItems = items.filter(item => item.entry.kind === BOOK_TYPE.local);
  const networkItems = items.filter(
    item => item.entry.kind === BOOK_TYPE.remote,
  );

  const toListItem = (
    item: BookListItem,
  ): ListItemData & { item: BookListItem } => {
    const { entry } = item;
    const isCurrentBook = getBookKey(currentBookRef) === getBookKey(item.ref);
    const isRemote = entry.kind === BOOK_TYPE.remote;
    const canSelect = !isCurrentBook && !item.error;
    const onSelect = () => {
      if (item.error) {
        if (item.networkRef) onNetworkRetry?.(item.networkRef);
      } else if (!isCurrentBook) {
        onBookSelect?.(item.ref, item.entry);
      }
    };
    const trailing = item.error ? (
      <Icon color="warningText" icon="warning" size="normal" />
    ) : isCurrentBook ? (
      <View style={styles.currentTag}>
        <Icon color="primaryText" icon="check" size="small" />
        <Text color="primaryText" weight="semibold" size="xs">
          当前
        </Text>
      </View>
    ) : mode === 'manage' && onBookMenu ? (
      <Pressable
        accessibilityLabel={`更多操作：${entry.name}`}
        hitSlop={6}
        onPress={() => onBookMenu(item)}
      >
        <Icon color="tertiary" icon="more" size="normal" />
      </Pressable>
    ) : undefined;

    return {
      value: getItemKey(item),
      item,
      left: <BookSpine item={item} />,
      titleText: entry.name,
      descriptionText: item.error
        ? '连接失败 · 重试'
        : isRemote
          ? item.networkRef?.serverUrl || '网络账本'
          : formatCreatedAt(entry.createdTime),
      right: trailing,
      disclosure: mode === 'select' && canSelect,
      onPress: item.error || canSelect ? onSelect : undefined,
      onLongPress:
        !item.error && mode === 'manage' && onBookMenu
          ? () => onBookMenu(item)
          : mode === 'select' && canSelect
            ? onSelect
            : undefined,
    };
  };

  const sections = [
    ...(localItems.length > 0
      ? [
          {
            key: 'local',
            titleText: '本地账本',
            countText: String(localItems.length),
            data: localItems.map(toListItem),
          },
        ]
      : []),
    ...(networkItems.length > 0
      ? [
          {
            key: 'remote',
            titleText: '网络账本',
            countText: String(networkItems.length),
            data: networkItems.map(toListItem),
          },
        ]
      : []),
  ];

  return (
    <List
      contentContainerStyle={styles.content}
      sections={sections}
      footer={
        <Column style={styles.listEnd} align="center">
          <Text color="tertiary" size="xs" textAlign="center">
            {mode === 'manage'
              ? '轻点整行切换账本 · 行尾「⋯」可编辑或删除'
              : '轻点整行切换账本'}
          </Text>
        </Column>
      }
      header={
        <Row style={styles.metaLine} gap={token.marginXXS} align="center">
          <Text color="tertiary" size="xs">
            共
          </Text>
          <Text color="secondary" size="xs" weight="semibold">
            {items.length}
          </Text>
          <Text color="tertiary" size="xs">
            本 · 本地
          </Text>
          <Text color="secondary" size="xs" weight="semibold">
            {localItems.length}
          </Text>
          <Text color="tertiary" size="xs">
            · 网络
          </Text>
          <Text color="secondary" size="xs" weight="semibold">
            {networkItems.length}
          </Text>
        </Row>
      }
      renderSwipeActions={({ item }) => {
        const book = item.item;
        if (mode !== 'manage') return undefined;
        if (book.entry.kind === BOOK_TYPE.remote) {
          return {
            rightActions: [
              {
                key: 'remove',
                actionText: '移除',
                color: 'danger',
                onPress: () =>
                  book.networkRef && onNetworkRemove?.(book.networkRef),
              },
            ],
          };
        }
        return {
          rightActions: [
            {
              key: 'edit',
              actionText: '编辑',
              color: 'primary',
              onPress: () => onBookEdit?.(book.entry),
            },
            {
              key: 'delete',
              actionText: '删除',
              color: 'danger',
              onPress: () => onBookDelete?.(book.entry.id),
            },
          ],
        };
      }}
      scrollEnabled
      showsVerticalScrollIndicator={false}
      style={styles.list}
      styles={{ header: styles.listHeader, footer: styles.listFooter }}
    />
  );
}
