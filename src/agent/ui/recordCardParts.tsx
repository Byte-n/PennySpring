import React, { useState } from 'react';
import dayjs from 'dayjs';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import {
  Card,
  Column,
  Icon,
  Loading,
  Row,
  Text,
  useTheme,
} from '@pennyspring/ui';
import { Pressable, StyleSheet } from 'react-native';

import type { ResolvedRecordDraft } from '../projection/recordDraft';

const CENTS_PER_YUAN = 100;

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
});

export function formatYuan(cents: number): string {
  return (cents / CENTS_PER_YUAN).toFixed(2);
}

export function formatRecordTime(value: number): string {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

/** 审批列表默认收起，同年省略年份以减少单行宽度。 */
export function formatRecordTimeCompact(
  value: number,
  now = Date.now(),
): string {
  const time = dayjs(value);
  return time.year() === dayjs(now).year()
    ? time.format('MM-DD HH:mm')
    : time.format('YYYY-MM-DD HH:mm');
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

export interface RecordBatchRowDetail {
  label: string;
  value: string;
}

export interface RecordBatchRowProps {
  index: number;
  title: string;
  amountText: string;
  /** 默认展示的一行摘要，例如时间、记录 ID 或变更项。 */
  metaText: string;
  /** 始终展示的风险提示，例如关联记录数量。 */
  warningText?: string;
  /** 默认折叠的次要信息。 */
  details?: readonly RecordBatchRowDetail[];
  testID?: string;
}

export function RecordBatchRow({
  index,
  title,
  amountText,
  metaText,
  warningText,
  details,
  testID,
}: RecordBatchRowProps): React.ReactElement {
  const { token } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const detailItems = details ?? [];
  const hasDetails = detailItems.length > 0;
  const isExpanded = hasDetails && expanded;

  const content = (
    <Column gap={token.marginXXS}>
      <Row align="center" gap="small" justify="between">
        <Text
          numberOfLines={1}
          size="sm"
          style={styles.flexOne}
          weight="medium"
        >
          {`${index}. ${title}`}
        </Text>
        <Text size="md" weight="semibold">
          {amountText}
        </Text>
      </Row>
      <Row align="center" gap="small" justify="between">
        <Text
          color="secondary"
          numberOfLines={1}
          size="xs"
          style={styles.flexOne}
        >
          {metaText}
        </Text>
        {hasDetails ? (
          <Icon
            color="tertiary"
            icon={isExpanded ? 'caret-up' : 'caret-down'}
            size="small"
          />
        ) : null}
      </Row>
      {warningText ? (
        <Text color="warningText" size="xs">
          {warningText}
        </Text>
      ) : null}
      {isExpanded ? (
        <Column gap={token.marginXXS}>
          {detailItems.map((detail, detailIndex) => (
            <Text
              color="secondary"
              key={`${detail.label}-${detailIndex}`}
              size="xs"
            >
              {`${detail.label}：${detail.value}`}
            </Text>
          ))}
        </Column>
      ) : null}
    </Column>
  );

  if (!hasDetails) {
    return content;
  }

  return (
    <Pressable
      accessibilityHint={isExpanded ? '收起明细' : '展开明细'}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
      onPress={() => setExpanded(value => !value)}
      testID={testID}
    >
      {content}
    </Pressable>
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
