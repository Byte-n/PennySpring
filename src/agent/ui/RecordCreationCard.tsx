import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import { Button, Card, Column, Row, Text, useToast } from '@pennyspring/ui';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import {
  resolveCreateRecordInput,
  type RecordMetadata,
  type ResolvedRecordDraft,
} from '../projection/recordDraft';
import { createRecordsInputSchema } from '../tools/createRecords';
import { getErrorMessage } from './errorMessage';
import {
  formatRecordTimeCompact,
  formatYuan,
  RecordBatchRow,
  type RecordBatchRowDetail,
  StatusCard,
} from './recordCardParts';

function buildRecordMeta(draft: ResolvedRecordDraft): string {
  const timeText = formatRecordTimeCompact(draft.recordTime);
  return draft.remark ? `${timeText} · ${draft.remark}` : timeText;
}

function buildRecordDetails(
  draft: ResolvedRecordDraft,
): RecordBatchRowDetail[] {
  const details: RecordBatchRowDetail[] = [];
  if (draft.intoAssetName) {
    details.push({
      label: '转账',
      value: `${draft.assetName || '未选择'} → ${draft.intoAssetName}`,
    });
  } else if (draft.assetName) {
    details.push({ label: '资产', value: draft.assetName });
  }
  if (draft.tags.length > 0) {
    details.push({
      label: '标签',
      value: draft.tags.map(tag => tag.name).join('、'),
    });
  }
  if (draft.chargeCents > 0) {
    details.push({
      label: '手续费',
      value: `¥${formatYuan(draft.chargeCents)}`,
    });
  }
  if (draft.isReimbursable) {
    details.push({ label: '可报销', value: '是' });
  }
  return details;
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

  const parsed = useMemo(
    () => createRecordsInputSchema.safeParse(args),
    [args],
  );
  const resolved = useMemo(() => {
    if (bookId === undefined || metadata === null || !parsed.success) {
      return null;
    }
    return parsed.data.records.map(record =>
      resolveCreateRecordInput(bookId, record, metadata, now),
    );
  }, [bookId, metadata, now, parsed]);

  const invalidError = useMemo(() => {
    if (!parsed.success) {
      return '记账参数不完整，请取消后让助手补充。';
    }
    if (resolved === null) {
      return '';
    }
    const invalidIndex = resolved.findIndex(item => !item.ok);
    if (invalidIndex < 0) {
      return '';
    }
    const item = resolved[invalidIndex];
    return `第 ${invalidIndex + 1} 笔：${item.ok ? '' : item.error}`;
  }, [parsed, resolved]);

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
        <Text color="secondary" size="sm">
          未写入账本。
        </Text>
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
    return (
      <Card size="small" titleText="已记账" variant="plain">
        <Text size="sm">
          {`已写入当前账本${resolved?.length ? `，共 ${resolved.length} 笔` : ''}。`}
        </Text>
      </Card>
    );
  }

  if (approval?.approved === true) {
    return (
      <StatusCard
        descriptionText="已确认，正在批量写入账本…"
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

  if (!parsed.success || resolved === null || invalidError) {
    const errorText = !parsed.success
      ? '记账参数不完整，请取消后让助手补充。'
      : invalidError;
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
        titleText="无法确认这批记账"
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
        {resolved.map((item, index) =>
          item.ok ? (
            <RecordBatchRow
              index={index + 1}
              key={`${item.draft.recordTime}-${index}`}
              amountText={`¥${formatYuan(item.draft.amountCents)}`}
              details={buildRecordDetails(item.draft)}
              metaText={buildRecordMeta(item.draft)}
              testID={`agent-record-create-item-${index + 1}`}
              title={`${item.draft.categoryLabel} · ${item.draft.typePath}`}
            />
          ) : null,
        )}
        <Text color="warningText" size="xs">
          {`确认后将写入当前账本，共 ${resolved.length} 笔`}
        </Text>
      </Column>
    </Card>
  );
}
