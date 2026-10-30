import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import { RECORD_TYPE_CATEGORY } from '@pennyspring/api';
import {
  Button,
  Card,
  Column,
  Loading,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import {
  resolveCreateRecordInput,
  type RecordMetadata,
  type ResolvedRecordDraft,
} from '../projection/recordDraft';
import { createRecordInputSchema } from '../tools/createRecord';
import { getErrorMessage } from './errorMessage';

const CENTS_PER_YUAN = 100;

function formatYuan(cents: number): string {
  return (cents / CENTS_PER_YUAN).toFixed(2);
}

function formatRecordTime(value: number): string {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

interface RecordSummaryProps {
  draft: ResolvedRecordDraft;
}

function RecordSummary({ draft }: RecordSummaryProps): React.ReactElement {
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

interface StatusCardProps {
  titleText: string;
  descriptionText: string;
  loading?: boolean;
  footer?: React.ReactNode;
}

function StatusCard({
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

function getResultRecordId(result: unknown): number | null {
  if (typeof result !== 'object' || result === null) {
    return null;
  }
  const recordId = (result as { recordId?: unknown }).recordId;
  return typeof recordId === 'number' ? recordId : null;
}

export function RecordCreationCard(
  props: ToolCallMessagePartProps,
): React.ReactElement {
  const { approval, args, isError, result, respondToApproval, status } = props;
  const api = useGlobalApi();
  const book = useBookStore(state => state.currentBook);
  const toast = useToast();
  const bookId = book?.id;
  const [metadata, setMetadata] = useState<RecordMetadata | null>(null);
  const [metadataError, setMetadataError] = useState('');
  const [responding, setResponding] = useState(false);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (bookId === undefined) {
      setMetadata(null);
      setMetadataError('未找到当前账本');
      return;
    }

    let cancelled = false;
    setMetadata(null);
    setMetadataError('');
    Promise.all([
      api.type.getAll(bookId),
      api.tag.getAll(bookId),
      api.asset.getByBook(bookId),
    ])
      .then(([types, tags, assets]) => {
        if (!cancelled) {
          setMetadata({ types, tags, assets });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setMetadataError(getErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [api, bookId]);

  const parsed = useMemo(() => createRecordInputSchema.safeParse(args), [args]);
  const resolved = useMemo(() => {
    if (bookId === undefined || metadata === null || !parsed.success) {
      return null;
    }
    return resolveCreateRecordInput(bookId, parsed.data, metadata, now);
  }, [bookId, metadata, now, parsed]);

  const handleRespond = useCallback(
    async (approved: boolean, reason?: string): Promise<void> => {
      if (responding) {
        return;
      }
      setResponding(true);
      try {
        await respondToApproval(
          approved
            ? { approved: true }
            : { approved: false, reason: reason ?? '用户取消' },
        );
      } catch (error) {
        toast.show({
          messageText: getErrorMessage(error),
          status: 'error',
        });
      } finally {
        setResponding(false);
      }
    },
    [respondToApproval, responding, toast],
  );

  const cancelFooter = (
    <Row justify="end">
      <Button
        disabled={responding}
        onPress={() => handleRespond(false, metadataError || '用户取消')}
        size="small"
        testID="agent-record-cancel"
        type="default"
      >
        取消
      </Button>
    </Row>
  );

  if (approval?.approved === false) {
    return (
      <Card size="small" titleText="已取消" variant="plain">
        {resolved?.ok ? (
          <RecordSummary draft={resolved.draft} />
        ) : (
          <Text color="secondary" size="sm">
            未写入账本。
          </Text>
        )}
      </Card>
    );
  }

  if (isError || status.type === 'incomplete') {
    return (
      <StatusCard
        descriptionText="未写入账本，请稍后重试或取消后修改参数。"
        footer={
          approval && approval.approved === undefined ? cancelFooter : undefined
        }
        titleText="记账失败"
      />
    );
  }

  if (result !== undefined) {
    const recordId = getResultRecordId(result);
    return (
      <Card size="small" titleText="已记账" variant="plain">
        <Column gap="small">
          {resolved?.ok ? (
            <RecordSummary draft={resolved.draft} />
          ) : (
            <Text size="sm">记录已写入账本。</Text>
          )}
          {recordId !== null ? (
            <Text color="tertiary" size="xs">
              {`记录 #${recordId}`}
            </Text>
          ) : null}
        </Column>
      </Card>
    );
  }

  if (approval?.approved === true) {
    return (
      <StatusCard
        descriptionText="已确认，正在写入账本…"
        loading
        titleText="正在记账"
      />
    );
  }

  if (!approval) {
    return (
      <StatusCard
        descriptionText="正在准备记账信息…"
        loading
        titleText="正在准备记账"
      />
    );
  }

  if (metadataError) {
    return (
      <StatusCard
        descriptionText={metadataError}
        footer={cancelFooter}
        titleText="无法读取记账信息"
      />
    );
  }

  if (metadata === null) {
    return (
      <StatusCard
        descriptionText="正在读取类型、标签和资产…"
        footer={cancelFooter}
        loading
        titleText="待确认的记账"
      />
    );
  }

  if (!parsed.success || resolved === null || !resolved.ok) {
    const errorText = !parsed.success
      ? '记账参数不完整，请取消后让助手补充。'
      : resolved?.ok === false
      ? resolved.error
      : '记账参数不完整，请取消后让助手补充。';
    return (
      <StatusCard
        descriptionText={errorText}
        footer={
          <Row justify="end">
            <Button
              disabled={responding}
              onPress={() => handleRespond(false, errorText)}
              size="small"
              testID="agent-record-cancel"
              type="default"
            >
              取消
            </Button>
          </Row>
        }
        titleText="无法确认这笔记账"
      />
    );
  }

  return (
    <Card
      footer={
        <Row gap="small" justify="end">
          <Button
            disabled={responding}
            onPress={() => handleRespond(false)}
            size="small"
            testID="agent-record-cancel"
            type="default"
          >
            取消
          </Button>
          <Button
            loading={responding}
            onPress={() => handleRespond(true)}
            size="small"
            testID="agent-record-confirm"
            type="primary"
          >
            确认记账
          </Button>
        </Row>
      }
      size="small"
      titleText="待确认的记账"
      variant="plain"
    >
      <Column gap="small">
        <RecordSummary draft={resolved.draft} />
        <Text color="warningText" size="xs">
          确认后将写入当前账本
        </Text>
      </Column>
    </Card>
  );
}
