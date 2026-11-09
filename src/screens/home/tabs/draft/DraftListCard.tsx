import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import {
  Button,
  Column,
  Icon,
  ImagePreview,
  Loading,
  Row,
  Text,
} from '@pennyspring/ui';
import {
  QUICK_BOOK_DRAFT_STATUS,
  type AssetRow,
  type QuickBookDraftRow,
  type TagRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  formatDraftAmount,
  formatDraftTimestamp,
  isAbsorptionDraftType,
  summarizeDraftTotals,
} from '../../../../features/quickBookDraft/draftLogic';
import { useQuickBookDraftProgress } from '../../../../features/quickBookDraft/draftProgress';
import { DraftAgentStream } from './DraftAgentStream';
import { DraftItemRow } from './DraftItemRow';
import { useDraftTabStyles } from './draftTabStyles';

const IMAGE_BUTTON_HIT_SLOP = 12;

interface DraftListCardProps {
  draft: QuickBookDraftRow;
  bookName: string;
  isBookMissing: boolean;
  typeMap: ReadonlyMap<number, TypeRow>;
  assetMap: ReadonlyMap<number, AssetRow>;
  tagMap: ReadonlyMap<number, TagRow>;
  isBusy: boolean;
  isRetrying: boolean;
  confirmingItemIndex: number | null;
  onDiscard: () => void;
  onRetry: () => void;
  onEditType: (itemIndex: number) => void;
  onEditAmount: (itemIndex: number) => void;
  onEditTags: (itemIndex: number) => void;
  onEditTime: (itemIndex: number) => void;
  onToggleAttach: (itemIndex: number, next: boolean) => void;
  onEdit: (itemIndex: number) => void;
  onConfirm: (itemIndex: number) => void;
}

export function DraftListCard({
  draft,
  bookName,
  isBookMissing,
  typeMap,
  assetMap,
  tagMap,
  isBusy,
  isRetrying,
  confirmingItemIndex,
  onDiscard,
  onRetry,
  onEditType,
  onEditAmount,
  onEditTags,
  onEditTime,
  onToggleAttach,
  onEdit,
  onConfirm,
}: DraftListCardProps): React.ReactElement {
  const styles = useDraftTabStyles();
  const progress = useQuickBookDraftProgress(draft.id);
  const [previewOpen, setPreviewOpen] = useState(false);
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
  const showImage = !isFailed && draft.imagePath !== '';
  const showSummary = !isFailed && draft.agentSummary !== '';
  const images = useMemo(
    () => (draft.imagePath === '' ? [] : [{ uri: draft.imagePath }]),
    [draft.imagePath],
  );
  const totals = useMemo(
    () => summarizeDraftTotals(draft.items, typeMap, draft.booksId),
    [draft.booksId, draft.items, typeMap],
  );
  const absorptionCount = useMemo(
    () =>
      draft.items.filter(
        item =>
          item.status !== 'confirmed' &&
          isAbsorptionDraftType(typeMap.get(item.typeId)),
      ).length,
    [draft.items, typeMap],
  );

  const totalNodes: React.ReactNode[] = [];
  function addTotal(
    label: string,
    cents: number,
    note?: string,
    key?: string,
  ): void {
    if (cents <= 0) {
      return;
    }
    if (totalNodes.length > 0) {
      totalNodes.push(
        <Text color="quaternary" key={`total-sep-${key}`} size="xs">
          ·
        </Text>,
      );
    }
    totalNodes.push(
      <Row key={`total-${key}`} style={styles.totalItem}>
        <Text color="secondary" size="xs">
          {label}
        </Text>
        <Text size="sm" style={styles.totalAmount} weight="semibold">
          {formatDraftAmount(cents)}
        </Text>
        {note ? (
          <Text color="tertiary" size="xs" style={styles.totalNote}>
            {note}
          </Text>
        ) : null}
      </Row>,
    );
  }

  addTotal('支出合计', totals.expenseCents, undefined, 'expense');
  addTotal('收入合计', totals.incomeCents, undefined, 'income');
  addTotal('转账', totals.transferCents, '（不计收支）', 'transfer');

  const pendingNotes: string[] = [];
  if (totals.pendingAmountCount > 0) {
    pendingNotes.push(`${totals.pendingAmountCount} 笔金额待确认`);
  }
  if (totals.unclassifiedCount > 0) {
    pendingNotes.push(`${totals.unclassifiedCount} 笔类型待确认`);
  }
  if (absorptionCount > 0) {
    pendingNotes.push(`${absorptionCount} 笔需关联支出`);
  }
  const showTotals = !isFailed && !isGenerating && itemCount > 1;

  return (
    <Column style={styles.card} testID={`draft-card-${draft.id}`}>
      <Row
        align="baseline"
        gap="small"
        justify="between"
        style={styles.cardMeta}
      >
        <Row align="baseline" gap="small" style={styles.metaText}>
          <Text
            color={isBookMissing ? 'warningText' : 'default'}
            numberOfLines={1}
            size="sm"
            style={styles.metaText}
            weight="semibold"
          >
            {bookName}
          </Text>
          <Text color="tertiary" size="xs" style={styles.cardTime}>
            {formatDraftTimestamp(displayTime)}
          </Text>
        </Row>
        <Text
          color={isFailed ? 'errorText' : 'tertiary'}
          size="xs"
          style={styles.progress}
        >
          {progressText}
        </Text>
      </Row>

      {showSummary || showImage ? (
        <Row align="start" gap="small" style={styles.summaryRow}>
          {showSummary ? (
            <Text
              color="secondary"
              numberOfLines={2}
              size="xs"
              style={styles.summaryText}
            >
              {draft.agentSummary}
            </Text>
          ) : (
            <Column style={styles.summaryText} />
          )}
          {showImage ? (
            <Pressable
              hitSlop={IMAGE_BUTTON_HIT_SLOP}
              onPress={() => setPreviewOpen(true)}
              style={({ pressed }) => [
                styles.imageButton,
                pressed ? styles.imageButtonPressed : null,
              ]}
            >
              <Icon color="tertiary" icon="image" size="small" />
              <Text color="tertiary" size="xs">
                原图
              </Text>
            </Pressable>
          ) : null}
        </Row>
      ) : null}

      {isFailed ? (
        <Text color="secondary" numberOfLines={2} size="sm">
          {draft.errorText || '未能生成草稿，可重试或丢弃。'}
        </Text>
      ) : null}

      {isGenerating ? (
        progress.parts.length > 0 ? (
          <DraftAgentStream parts={progress.parts} />
        ) : (
          <Loading size="small" />
        )
      ) : null}

      {isPending ? (
        <Column style={styles.items}>
          {draft.items.map((item, index) => (
            <DraftItemRow
              assetMap={assetMap}
              booksId={draft.booksId}
              fallbackAttachImage={draft.attachImage}
              headerTime={draft.createdTime}
              isBookMissing={isBookMissing}
              isBusy={isBusy}
              isConfirming={confirmingItemIndex === index}
              isFirst={index === 0}
              item={item}
              key={`${draft.id}-${index}`}
              onConfirm={() => onConfirm(index)}
              onEdit={() => onEdit(index)}
              onEditAmount={() => onEditAmount(index)}
              onEditTags={() => onEditTags(index)}
              onEditTime={() => onEditTime(index)}
              onEditType={() => onEditType(index)}
              onToggleAttach={next => onToggleAttach(index, next)}
              tagMap={tagMap}
              typeMap={typeMap}
            />
          ))}
        </Column>
      ) : null}

      {showTotals ? (
        <Row align="baseline" justify="between" style={styles.totalRow}>
          <Row align="baseline" style={styles.totalItems}>
            {totalNodes.length > 0 ? (
              totalNodes
            ) : (
              <Text color="tertiary" size="xs">
                合计待补全
              </Text>
            )}
          </Row>
          {pendingNotes.length > 0 ? (
            <Text color="warningText" numberOfLines={1} size="xs">
              {`另有 ${pendingNotes.join(' · ')}`}
            </Text>
          ) : null}
        </Row>
      ) : null}

      {isBookMissing && isPending ? (
        <Text color="warningText" size="xs">
          目标账本当前不可用，请联网或切换账本后重试；也可以丢弃草稿。
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

      {showImage ? (
        <ImagePreview
          images={images}
          onCancel={() => setPreviewOpen(false)}
          onOpenChange={open => {
            if (!open) {
              setPreviewOpen(false);
            }
          }}
          open={previewOpen}
        />
      ) : null}
    </Column>
  );
}
