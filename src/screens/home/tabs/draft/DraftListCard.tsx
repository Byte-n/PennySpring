import React from 'react';
import {
  Button,
  Column,
  Image,
  Loading,
  Row,
  Tag,
  Text,
} from '@pennyspring/ui';
import {
  QUICK_BOOK_DRAFT_STATUS,
  type QuickBookDraftRow,
  type TypeRow,
} from '@pennyspring/api';

import {
  DRAFT_MISSING_AMOUNT_TEXT,
  DRAFT_MISSING_TYPE_TEXT,
  formatDraftAmount,
  formatDraftTimestamp,
  getDraftItemMissingLabels,
  getDraftItemTypeLabel,
} from '../../../../features/quickBookDraft/draftLogic';
import { useDraftTabStyles } from './draftTabStyles';

interface DraftListCardProps {
  draft: QuickBookDraftRow;
  bookName: string;
  isBookMissing: boolean;
  typeMap: ReadonlyMap<number, TypeRow>;
  isRetrying: boolean;
  onOpen: () => void;
  onDiscard: () => void;
  onRetry: () => void;
}

interface DraftStatusView {
  label: string;
  color: 'warning' | 'danger' | 'info' | 'success';
}

function getStatusView(status: QuickBookDraftRow['status']): DraftStatusView {
  if (status === QUICK_BOOK_DRAFT_STATUS.failed) {
    return { label: '失败', color: 'danger' };
  }
  if (status === QUICK_BOOK_DRAFT_STATUS.generating) {
    return { label: '生成中', color: 'info' };
  }
  if (status === QUICK_BOOK_DRAFT_STATUS.confirmed) {
    return { label: '已完成', color: 'success' };
  }
  return { label: '待确认', color: 'warning' };
}

function getMissingHint(
  draft: QuickBookDraftRow,
  item: QuickBookDraftRow['items'][number],
  typeMap: ReadonlyMap<number, TypeRow>,
): string {
  const labels = getDraftItemMissingLabels(
    item,
    typeMap.get(item.typeId),
    draft.booksId,
  ).filter(
    label =>
      label !== DRAFT_MISSING_AMOUNT_TEXT && label !== DRAFT_MISSING_TYPE_TEXT,
  );
  return labels.join(' · ');
}

export function DraftListCard({
  draft,
  bookName,
  isBookMissing,
  typeMap,
  isRetrying,
  onOpen,
  onDiscard,
  onRetry,
}: DraftListCardProps): React.ReactElement {
  const styles = useDraftTabStyles();
  const statusView = getStatusView(draft.status);
  const isFailed = draft.status === QUICK_BOOK_DRAFT_STATUS.failed;
  const isGenerating = draft.status === QUICK_BOOK_DRAFT_STATUS.generating;
  const isPending = draft.status === QUICK_BOOK_DRAFT_STATUS.pending;
  const displayTime = isFailed ? draft.updatedTime : draft.createdTime;
  const title = isFailed
    ? `生成失败 · ${formatDraftTimestamp(displayTime)}`
    : isGenerating
      ? `生成中 · ${formatDraftTimestamp(displayTime)}`
      : `共 ${draft.items.length} 笔 · ${formatDraftTimestamp(displayTime)}`;

  return (
    <Column style={styles.card} testID={`draft-card-${draft.id}`}>
      <Row style={styles.cardHead}>
        <Image
          preview
          radius="normal"
          src={{ uri: draft.imagePath }}
          style={styles.thumb}
        />
        <Column style={styles.meta}>
          <Text
            color={isFailed ? 'errorText' : 'heading'}
            numberOfLines={1}
            size="sm"
            weight="semibold"
          >
            {title}
          </Text>
          <Text
            color={isBookMissing ? 'warningText' : 'tertiary'}
            numberOfLines={1}
            size="xs"
          >
            {`账本：${bookName}`}
          </Text>
          {isPending ? (
            <Text color="secondary" size="xs">
              {`已确认 ${draft.confirmedCount}/${draft.items.length}`}
            </Text>
          ) : null}
        </Column>
        <Tag
          color={statusView.color}
          size="small"
          testID={`draft-status-${draft.id}`}
        >
          {statusView.label}
        </Tag>
      </Row>

      {isFailed ? (
        <Text color="secondary" size="sm" style={styles.errorText}>
          {draft.errorText || '未能生成草稿，可重试或丢弃。'}
        </Text>
      ) : null}

      {isGenerating ? <Loading size="small" text="生成中" /> : null}

      {isPending ? (
        <Column style={styles.items}>
          {draft.items.map((item, index) => {
            const type = typeMap.get(item.typeId);
            const missingHint = getMissingHint(draft, item, typeMap);
            const isAmountMissing =
              item.amountCents === null || item.amountCents <= 0;
            return (
              <Row key={`${draft.id}-${index}`} style={styles.itemRow}>
                <Column style={styles.itemCopy}>
                  <Text color="default" numberOfLines={1} size="sm">
                    {getDraftItemTypeLabel(type, typeMap)}
                  </Text>
                  {missingHint ? (
                    <Text color="warningText" size="xs">
                      {missingHint}
                    </Text>
                  ) : null}
                </Column>
                <Column style={styles.itemAmount}>
                  <Text
                    color={isAmountMissing ? 'warningText' : 'heading'}
                    numberOfLines={1}
                    size="sm"
                    style={styles.num}
                    weight="medium"
                  >
                    {formatDraftAmount(
                      isAmountMissing ? null : item.amountCents,
                    )}
                  </Text>
                </Column>
              </Row>
            );
          })}
        </Column>
      ) : null}

      {isFailed || isPending ? (
        <Row style={styles.actions}>
          <Button disabled={isRetrying} onPress={onDiscard} type="default">
            丢弃
          </Button>
          {isFailed ? (
            <Button loading={isRetrying} onPress={onRetry} type="primary">
              重试
            </Button>
          ) : null}
          {isPending ? (
            <Button onPress={onOpen} type="primary">
              去确认
            </Button>
          ) : null}
        </Row>
      ) : null}
    </Column>
  );
}
