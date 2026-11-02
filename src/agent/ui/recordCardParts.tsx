import React from 'react';
import dayjs from 'dayjs';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import { Card, Column, Loading, Row, Text } from '@pennyspring/ui';

import type { ResolvedRecordDraft } from '../projection/recordDraft';

const CENTS_PER_YUAN = 100;

export function formatYuan(cents: number): string {
  return (cents / CENTS_PER_YUAN).toFixed(2);
}

export function formatRecordTime(value: number): string {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export function getResultRecordIds(result: unknown): number[] {
  if (typeof result !== 'object' || result === null) {
    return [];
  }
  const raw = result as {
    recordId?: unknown;
    recordIds?: unknown;
    records?: unknown;
  };
  if (typeof raw.recordId === 'number') {
    return [raw.recordId];
  }
  if (Array.isArray(raw.recordIds)) {
    return raw.recordIds.filter(
      (recordId): recordId is number => typeof recordId === 'number',
    );
  }
  if (Array.isArray(raw.records)) {
    return raw.records
      .map(item =>
        typeof item === 'object' && item !== null
          ? (item as { recordId?: unknown }).recordId
          : undefined,
      )
      .filter((recordId): recordId is number => typeof recordId === 'number');
  }
  return [];
}

export interface RecordSummaryProps {
  draft: ResolvedRecordDraft;
}

export function RecordSummary({
  draft,
}: RecordSummaryProps): React.ReactElement {
  const isTransfer = draft.category === RECORD_TYPE_CATEGORY.transfer;

  return (
    <Column gap="small">
      <Row align="center" justify="between">
        <Text size="sm" weight="medium">
          {draft.categoryLabel} · {draft.typePath}
        </Text>
        <Text size="lg" weight="semibold">
          {`¥${formatYuan(draft.amountCents)}`}
        </Text>
      </Row>
      <Text color="secondary" size="xs">
        {formatRecordTime(draft.recordTime)}
      </Text>
      {draft.chargeCents > 0 ? (
        <Text color="secondary" size="xs">
          {`手续费 ¥${formatYuan(draft.chargeCents)}`}
        </Text>
      ) : null}
      {draft.remark ? <Text size="sm">备注：{draft.remark}</Text> : null}
      {draft.tags.length > 0 ? (
        <Text color="secondary" size="xs">
          标签：{draft.tags.map(tag => tag.name).join('、')}
        </Text>
      ) : null}
      {draft.isReimbursable ? (
        <Text color="secondary" size="xs">
          可报销
        </Text>
      ) : null}
      {isTransfer ? (
        <Text color="secondary" size="xs">
          转出：{draft.assetName} → 转入：{draft.intoAssetName}
        </Text>
      ) : (
        <Text color="secondary" size="xs">
          资产：{draft.assetName || '未选择'}
        </Text>
      )}
    </Column>
  );
}

export interface RecordBatchRowProps {
  index: number;
  title: string;
  amountText: string;
  timeText: string;
  note?: string;
}

export function RecordBatchRow({
  index,
  title,
  amountText,
  timeText,
  note,
}: RecordBatchRowProps): React.ReactElement {
  return (
    <Column gap="small">
      <Row align="center" gap="small" justify="between">
        <Text numberOfLines={1} size="sm" weight="medium">
          {`${index}. ${title}`}
        </Text>
        <Text size="md" weight="semibold">
          {amountText}
        </Text>
      </Row>
      <Text color="secondary" size="xs">
        {timeText}
      </Text>
      {note ? (
        <Text color="warningText" size="xs">
          {note}
        </Text>
      ) : null}
    </Column>
  );
}

export interface StatusCardProps {
  titleText: string;
  descriptionText: string;
  loading?: boolean;
  footer?: React.ReactNode;
}

export function StatusCard({
  titleText,
  descriptionText,
  loading = false,
  footer,
}: StatusCardProps): React.ReactElement {
  return (
    <Card size="small" titleText={titleText} variant="plain" footer={footer}>
      <Row align="center" gap="small">
        {loading ? <Loading size="small" /> : null}
        <Text color="secondary" size="sm">
          {descriptionText}
        </Text>
      </Row>
    </Card>
  );
}
