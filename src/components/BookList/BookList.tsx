import React from 'react';
import { Image, ScrollView } from 'react-native';
import type { ImageStyle, StyleProp, TextStyle } from 'react-native';
import {
  Card,
  Column,
  Empty,
  Icon,
  Row,
  SwipeAction,
  Tag,
  Text,
} from '@pennyspring/ui';
import { BOOK_TYPE, type BookRow } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { BookEntry, CurrentBookRef } from '../../stores/bookStore';
import type { NetworkBookRef } from '../../stores/networkBookStore';

export interface BookListItem {
  entry: BookEntry;
  ref: CurrentBookRef;
  networkRef?: NetworkBookRef;
}

export interface BookListProps {
  mode: 'select' | 'manage';
  items: BookListItem[];
  currentBook: BookEntry | null;
  onBookSelect?: (ref: CurrentBookRef, entry: BookEntry) => void;
  onBookEdit?: (book: BookRow) => void;
  onBookDelete?: (id: number) => void;
  onNetworkRemove?: (ref: NetworkBookRef) => void;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    flex: 1,
    padding: token.padding,
    gap: token.marginSM,
  },
  card: {
    borderWidth: token.lineWidth,
    padding: token.padding,
    borderRadius: token.borderRadiusLG,
    gap: token.marginSM,
  },
  cardSelected: {
    borderColor: token.colorPrimaryBorder,
    backgroundColor: token.colorPrimaryBg,
  },
  cardMain: {
    gap: token.marginSM,
  },
  cardInfo: {
    flex: 1,
    gap: token.marginXS,
  },
  cardTitle: {
    alignItems: 'center',
    gap: token.marginXS,
  },
  cardName: {
    flex: 1,
    fontSize: token.fontSizeLG,
    lineHeight: token.lineHeightLG,
    fontWeight: token.fontWeightStrong as TextStyle['fontWeight'],
    color: token.colorTextHeading,
  },
  kindTagText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  cardIdTagText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  currentTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXXS,
  },
  currentTagText: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorPrimaryText,
  },
  cardDesc: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
  },
  cardDescEmpty: {
    color: token.colorTextTertiary,
  },
  cardServerUrl: {
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    color: token.colorTextQuaternary,
  },
  cardTimeSummary: {
    paddingTop: token.paddingXXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorBorderSecondary,
  },
  cardCover: {
    width: token.controlHeightLG * 2,
    height: token.controlHeightLG * 2,
    borderRadius: token.borderRadiusLG,
    backgroundColor: token.colorFillTertiary,
    overflow: 'hidden',
  },
  cardCoverImage: {
    width: '100%',
    height: '100%',
  },
  cardCoverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: token.paddingXS,
  },
  cardCoverPlaceholderText: {
    fontSize: token.fontSizeSM,
    color: token.colorTextTertiary,
    textAlign: 'center',
  },
}));

const DATE_TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

function formatBookTime(time: number): string {
  if (!Number.isFinite(time) || time <= 0) {
    return '未知';
  }

  return new Date(time).toLocaleString('zh-CN', DATE_TIME_FORMAT_OPTIONS);
}

function getItemKey(item: BookListItem): string {
  return item.entry.kind === BOOK_TYPE.remote
    ? `remote-${item.networkRef?.serverUrl ?? ''}-${item.entry.id}`
    : `local-${item.entry.id}`;
}

export function BookList({
  mode,
  items,
  currentBook,
  onBookSelect,
  onBookEdit,
  onBookDelete,
  onNetworkRemove,
}: BookListProps) {
  const styles = useStyles();
  const cardCoverImageStyle = styles.cardCoverImage as StyleProp<ImageStyle>;

  if (items.length === 0) {
    return <Empty />;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {items.map(item => {
        const { entry } = item;
        const isCurrentBook =
          currentBook?.kind === entry.kind && currentBook?.id === entry.id;
        const isRemote = entry.kind === BOOK_TYPE.remote;

        const leftActions =
          mode === 'select'
            ? [
                {
                  key: 'select',
                  actionText: isCurrentBook ? '当前' : '选择',
                  color: isCurrentBook ? ('weak' as const) : ('success' as const),
                  disabled: isCurrentBook,
                  onPress: () => onBookSelect?.(item.ref, item.entry),
                },
              ]
            : [
                {
                  key: 'select',
                  actionText: isCurrentBook ? '当前' : '选择',
                  color: isCurrentBook ? ('weak' as const) : ('success' as const),
                  disabled: isCurrentBook,
                  onPress: () => onBookSelect?.(item.ref, item.entry),
                },
              ];

        const rightActions =
          mode === 'manage'
            ? isRemote
              ? [
                  {
                    key: 'remove',
                    actionText: '移除',
                    color: 'danger' as const,
                    onPress: () =>
                      item.networkRef && onNetworkRemove?.(item.networkRef),
                  },
                ]
              : [
                  {
                    key: 'edit',
                    actionText: '编辑',
                    color: 'primary' as const,
                    onPress: () => onBookEdit?.(entry),
                  },
                  {
                    key: 'delete',
                    actionText: '删除',
                    color: 'danger' as const,
                    onPress: () => onBookDelete?.(entry.id),
                  },
                ]
            : [];

        const handleCardPress =
          mode === 'select' && !isCurrentBook
            ? () => onBookSelect?.(item.ref, item.entry)
            : undefined;

        return (
          <SwipeAction
            key={getItemKey(item)}
            leftActions={leftActions}
            rightActions={rightActions}
          >
            <Card
              style={[styles.card, isCurrentBook && styles.cardSelected]}
              onPress={handleCardPress}
            >
              <Row align="center" style={styles.cardMain}>
                <Column style={styles.cardInfo}>
                  <Row style={styles.cardTitle}>
                    <Text numberOfLines={1} style={styles.cardName}>
                      {entry.name}
                    </Text>
                    {isCurrentBook ? (
                      <Tag
                        color="primary"
                        size="small"
                        styles={{ content: styles.currentTagText }}
                        variant="filled"
                      >
                        <Row style={styles.currentTagContent}>
                          <Icon color="primaryText" icon="check" size="small" />
                          <Text style={styles.currentTagText}>当前</Text>
                        </Row>
                      </Tag>
                    ) : null}
                    <Tag
                      size="small"
                      variant="outlined"
                      styles={{ content: styles.kindTagText }}
                    >
                      {isRemote ? '网络' : '本地'}
                    </Tag>
                    <Tag
                      size="small"
                      variant="outlined"
                      styles={{ content: styles.cardIdTagText }}
                    >
                      {`#${entry.id}`}
                    </Tag>
                  </Row>
                  {isRemote && item.networkRef ? (
                    <Text style={styles.cardServerUrl} numberOfLines={1}>
                      {item.networkRef.serverUrl}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      styles.cardDesc,
                      !entry.description && styles.cardDescEmpty,
                    ]}
                    color="tertiary"
                  >
                    {entry.description || '暂无描述'}
                  </Text>
                  <Column style={styles.cardTimeSummary}>
                    <Text color="quaternary" size="sm">
                      {`创建：${formatBookTime(entry.createdTime)}`}
                    </Text>
                    <Text color="quaternary" size="sm">
                      {`更新：${formatBookTime(entry.updatedTime)}`}
                    </Text>
                  </Column>
                </Column>
                <Column style={styles.cardCover}>
                  {entry.background ? (
                    <Image
                      resizeMode="cover"
                      source={{ uri: entry.background }}
                      style={cardCoverImageStyle}
                    />
                  ) : (
                    <Column style={styles.cardCoverPlaceholder}>
                      <Text style={styles.cardCoverPlaceholderText}>
                        暂无图片
                      </Text>
                    </Column>
                  )}
                </Column>
              </Row>
            </Card>
          </SwipeAction>
        );
      })}
    </ScrollView>
  );
}
