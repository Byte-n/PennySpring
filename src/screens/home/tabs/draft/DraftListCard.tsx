import React from 'react';
import {
  Button,
  Column,
  Icon,
  Loading,
  Row,
  Switch,
  Text,
} from '@pennyspring/ui';
import {
  QUICK_BOOK_DRAFT_STATUS,
  type AssetRow,
  type QuickBookDraftRow,
  type TypeRow,
} from '@pennyspring/api';
import { ImageSquareIcon } from 'phosphor-react-native';

import { formatDraftTimestamp } from '../../../../features/quickBookDraft/draftLogic';
import { DraftItemRow, type DraftFillField } from './DraftItemRow';
import { useDraftTabStyles } from './draftTabStyles';

interface DraftListCardProps {
  draft: QuickBookDraftRow;
  bookName: string;
  isBookMissing: boolean;
  typeMap: ReadonlyMap<number, TypeRow>;
  assetMap: ReadonlyMap<number, AssetRow>;
  isBusy: boolean;
  isRetrying: boolean;
  isTogglingAttach: boolean;
  confirmingItemIndex: number | null;
  onDiscard: () => void;
  onRetry: () => void;
  onToggleAttach: (next: boolean) => void;
  onFill: (itemIndex: number, field: DraftFillField) => void;
  onEdit: (itemIndex: number) => void;
  onConfirm: (itemIndex: number) => void;
}

export function DraftListCard({
  draft,
  bookName,
  isBookMissing,
  typeMap,
  assetMap,
  isBusy,
  isRetrying,
  isTogglingAttach,
  confirmingItemIndex,
  onDiscard,
  onRetry,
  onToggleAttach,
  onFill,
  onEdit,
  onConfirm,
}: DraftListCardProps): React.ReactElement {
  const styles = useDraftTabStyles();
  const isFailed = draft.status === QUICK_BOOK_DRAFT_STATUS.failed;
  const isGenerating = draft.status === QUICK_BOOK_DRAFT_STATUS.generating;
  const isPending = draft.status === QUICK_BOOK_DRAFT_STATUS.pending;
  const isConfirmed = draft.status === QUICK_BOOK_DRAFT_STATUS.confirmed;
  const canDiscard =
    draft.status !== QUICK_BOOK_DRAFT_STATUS.confirmed &&
    draft.status !== QUICK_BOOK_DRAFT_STATUS.discarded;
  const displayTime = isFailed ? draft.updatedTime : draft.createdTime;
  const itemCount = draft.items.length;
  const progressText = isFailed
    ? '失败'
    : isGenerating
      ? '分析中'
      : itemCount === 0
        ? '暂无明细'
        : isConfirmed
          ? `全部完成 ${itemCount}/${itemCount}`
          : `已记账 ${draft.confirmedCount}/${itemCount}`;

  return (
    <Column style={styles.card} testID={`draft-card-${draft.id}`}>
      <Row
        align="baseline"
        gap="small"
        justify="between"
        style={styles.cardMeta}
      >
        <Text
          color={isBookMissing ? 'warningText' : 'tertiary'}
          numberOfLines={1}
          size="xs"
          style={styles.metaText}
        >
          {`${bookName} · ${formatDraftTimestamp(displayTime)}`}
        </Text>
        <Text
          color={isFailed ? 'errorText' : 'tertiary'}
          size="xs"
          style={styles.progress}
        >
          {progressText}
        </Text>
      </Row>

      {isFailed ? (
        <Text color="secondary" numberOfLines={2} size="sm">
          {draft.errorText || '未能生成草稿，可重试或丢弃。'}
        </Text>
      ) : null}

      {isGenerating ? <Loading size="small" /> : null}

      {isPending ? (
        <Column style={styles.items}>
          {draft.items.map((item, index) => (
            <DraftItemRow
              assetMap={assetMap}
              booksId={draft.booksId}
              isBookMissing={isBookMissing}
              isBusy={isBusy}
              isConfirming={confirmingItemIndex === index}
              item={item}
              key={`${draft.id}-${index}`}
              onConfirm={() => onConfirm(index)}
              onEdit={() => onEdit(index)}
              onFill={field => onFill(index, field)}
              typeMap={typeMap}
            />
          ))}
        </Column>
      ) : null}

      {isPending ? (
        <Row align="center" gap="small" style={styles.attachRow}>
          <Icon color="tertiary" icon={ImageSquareIcon} size="small" />
          <Text color="tertiary" size="xs" style={styles.attachLabel}>
            随记录带上截图
          </Text>
          <Switch
            disabled={isTogglingAttach || isBookMissing || isBusy}
            onChange={onToggleAttach}
            value={draft.attachImage}
          />
        </Row>
      ) : null}

      {isBookMissing && isPending ? (
        <Text color="warningText" size="xs">
          目标账本已不存在，请丢弃后重新截图。
        </Text>
      ) : null}

      {canDiscard || isFailed ? (
        <Row align="center" justify="between" style={styles.actions}>
          {canDiscard ? (
            <Button
              color="default"
              disabled={isRetrying || isBusy}
              onPress={onDiscard}
              size="small"
              type="text"
            >
              丢弃
            </Button>
          ) : (
            <Row />
          )}
          {isFailed ? (
            <Button
              disabled={isBusy}
              loading={isRetrying}
              onPress={onRetry}
              size="small"
              type="primary"
            >
              重试
            </Button>
          ) : null}
        </Row>
      ) : null}
    </Column>
  );
}
