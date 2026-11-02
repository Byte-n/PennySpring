import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import type { RecordDetail } from '@pennyspring/api';
import { Button, Card, Column, Row, Text, useToast } from '@pennyspring/ui';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import type { RecordMetadata } from '../projection/recordDraft';
import { summarizeRecord } from '../projection/recordUpdateDraft';
import { deleteRecordsInputSchema } from '../tools/deleteRecords';
import { getErrorMessage } from './errorMessage';
import { RecordBatchRow, StatusCard } from './recordCardParts';

function buildDeleteNote(
  detail: RecordDetail,
  assetText: string,
): string | undefined {
  const parts: string[] = [];
  if (detail.relatedRecordIds.length > 0) {
    parts.push(
      `含 ${detail.relatedRecordIds.length} 笔关联记录，删除后会重新计算`,
    );
  }
  if (assetText) {
    parts.push(`资产：${assetText}`);
  }
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function RecordDeletionCard(
  props: ToolCallMessagePartProps,
): React.ReactElement {
  const { approval, args, isError, result, respondToApproval, status } = props;
  const api = useGlobalApi();
  const book = useBookStore(state => state.currentBook);
  const toast = useToast();
  const bookId = book?.id;
  const [details, setDetails] = useState<RecordDetail[] | null>(null);
  const [metadata, setMetadata] = useState<RecordMetadata | null>(null);
  const [loadError, setLoadError] = useState('');
  const [responding, setResponding] = useState(false);

  const parsed = useMemo(
    () => deleteRecordsInputSchema.safeParse(args),
    [args],
  );
  const recordIds = useMemo(
    () => (parsed.success ? parsed.data.recordIds : []),
    [parsed],
  );

  useEffect(() => {
    if (bookId === undefined) {
      setDetails(null);
      setMetadata(null);
      setLoadError('未找到当前账本');
      return;
    }
    if (!parsed.success) {
      setDetails(null);
      setMetadata(null);
      setLoadError('删除参数不完整，请取消后让助手补充。');
      return;
    }

    let cancelled = false;
    setDetails(null);
    setMetadata(null);
    setLoadError('');
    Promise.all([
      Promise.all(
        recordIds.map(recordId => api.record.getDetailById(recordId, bookId)),
      ),
      api.type.getAll(bookId),
      api.tag.getAll(bookId),
      api.asset.getByBook(bookId),
    ])
      .then(([recordDetails, types, tags, assets]) => {
        if (!cancelled) {
          setDetails(recordDetails);
          setMetadata({ types, tags, assets });
        }
      })
      .catch(error => {
        if (!cancelled) {
          setLoadError(getErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [api, bookId, parsed, recordIds]);

  const resolved = useMemo(() => {
    if (details === null || metadata === null) {
      return null;
    }
    return details.map(detail => {
      const summary = summarizeRecord(
        {
          record: detail.record,
          tagIds: detail.tagIds,
          imagePaths: detail.imagePaths,
        },
        metadata,
      );
      return summary ? { detail, summary } : null;
    });
  }, [details, metadata]);

  const invalidError = useMemo(() => {
    if (!parsed.success) {
      return '删除参数不完整，请取消后让助手补充。';
    }
    if (resolved === null) {
      return '';
    }
    const invalidIndex = resolved.findIndex(item => item === null);
    return invalidIndex < 0 ? '' : `第 ${invalidIndex + 1} 条无法读取记录信息`;
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
        onPress={() => handleRespond(false, loadError || '用户取消')}
        size="small"
        testID="agent-record-delete-cancel"
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
          未删除账本记录。
        </Text>
      </Card>
    );
  }

  if (isError || status.type === 'incomplete') {
    return (
      <StatusCard
        descriptionText="未删除账本记录，请稍后重试或取消后调整参数。"
        footer={
          approval && approval.approved === undefined ? cancelFooter : undefined
        }
        titleText="删除失败"
      />
    );
  }

  if (result !== undefined) {
    return (
      <Card size="small" titleText="已删除" variant="plain">
        <Text size="sm">
          {`已从当前账本删除${
            resolved?.length ? ` ${resolved.length} 条` : ''
          }记录。`}
        </Text>
      </Card>
    );
  }

  if (approval?.approved === true) {
    return (
      <StatusCard
        descriptionText="已确认，正在批量删除记录…"
        loading
        titleText="正在删除记录"
      />
    );
  }

  if (!approval) {
    return (
      <StatusCard
        descriptionText="正在准备删除内容…"
        loading
        titleText="正在准备删除"
      />
    );
  }

  if (loadError) {
    return (
      <StatusCard
        descriptionText={loadError}
        footer={cancelFooter}
        titleText="无法读取记录"
      />
    );
  }

  if (details === null || metadata === null) {
    return (
      <StatusCard
        descriptionText="正在读取记录与类型、标签、资产…"
        footer={cancelFooter}
        loading
        titleText="待确认的删除"
      />
    );
  }

  if (!parsed.success || resolved === null || invalidError) {
    const errorText = !parsed.success
      ? '删除参数不完整，请取消后让助手补充。'
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
              testID="agent-record-delete-cancel"
              type="default"
            >
              取消
            </Button>
          </Row>
        }
        titleText="无法确认这批删除"
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
            testID="agent-record-delete-cancel"
            type="default"
          >
            取消
          </Button>
          <Button
            loading={responding}
            onPress={() => handleRespond(true)}
            size="small"
            testID="agent-record-delete-confirm"
            type="danger"
          >
            确认删除
          </Button>
        </Row>
      }
      size="small"
      titleText="待确认的删除"
      variant="plain"
    >
      <Column gap="small">
        {resolved.map((item, index) =>
          item ? (
            <RecordBatchRow
              index={index + 1}
              key={`${item.detail.record.id}-${index}`}
              amountText={item.summary.amount}
              note={buildDeleteNote(item.detail, item.summary.asset)}
              timeText={`#${item.detail.record.id} · ${item.summary.recordTime}`}
              title={item.summary.category}
            />
          ) : null,
        )}
        <Text color="warningText" size="xs">
          {`删除不可恢复，确认后将删除当前账本中的 ${resolved.length} 条记录`}
        </Text>
      </Column>
    </Card>
  );
}
