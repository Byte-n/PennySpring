import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import type { RecordDetail } from '@pennyspring/api';
import { Button, Card, Column, Row, Text, useToast } from '@pennyspring/ui';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import type { RecordMetadata } from '../projection/recordDraft';
import {
  resolveUpdateRecordInput,
  summarizeRecord,
  type RecordChange,
} from '../projection/recordUpdateDraft';
import { updateRecordInputSchema } from '../tools/updateRecord';
import { getErrorMessage } from './errorMessage';
import {
  getResultRecordId,
  RecordSummary,
  StatusCard,
} from './recordCardParts';

export function RecordUpdateCard(
  props: ToolCallMessagePartProps,
): React.ReactElement {
  const { approval, args, isError, result, respondToApproval, status } = props;
  const api = useGlobalApi();
  const book = useBookStore(state => state.currentBook);
  const toast = useToast();
  const bookId = book?.id;
  const [detail, setDetail] = useState<RecordDetail | null>(null);
  const [metadata, setMetadata] = useState<RecordMetadata | null>(null);
  const [loadError, setLoadError] = useState('');
  const [responding, setResponding] = useState(false);

  const parsed = useMemo(() => updateRecordInputSchema.safeParse(args), [args]);
  const recordId = parsed.success ? parsed.data.recordId : undefined;
  const addedImageCount = parsed.success
    ? (parsed.data.attachmentIds?.length ?? 0)
    : 0;

  useEffect(() => {
    if (bookId === undefined) {
      setDetail(null);
      setMetadata(null);
      setLoadError('未找到当前账本');
      return;
    }
    if (recordId === undefined) {
      setDetail(null);
      setMetadata(null);
      setLoadError('修改参数不完整，请取消后让助手补充。');
      return;
    }

    let cancelled = false;
    setDetail(null);
    setMetadata(null);
    setLoadError('');
    Promise.all([
      api.record.getDetailById(recordId, bookId),
      api.type.getAll(bookId),
      api.tag.getAll(bookId),
      api.asset.getByBook(bookId),
    ])
      .then(([recordDetail, types, tags, assets]) => {
        if (!cancelled) {
          setDetail(recordDetail);
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
  }, [api, bookId, recordId]);

  const resolved = useMemo(() => {
    if (bookId === undefined || detail === null || metadata === null) {
      return null;
    }
    if (!parsed.success) {
      return null;
    }
    return resolveUpdateRecordInput(
      bookId,
      {
        record: detail.record,
        tagIds: detail.tagIds,
        imagePaths: detail.imagePaths,
      },
      parsed.data,
      metadata,
    );
  }, [bookId, detail, metadata, parsed]);

  const currentSummary = useMemo(() => {
    if (detail === null || metadata === null) {
      return null;
    }
    return summarizeRecord(
      {
        record: detail.record,
        tagIds: detail.tagIds,
        imagePaths: detail.imagePaths,
      },
      metadata,
    );
  }, [detail, metadata]);

  const changes = useMemo<RecordChange[]>(() => {
    if (!resolved?.ok) {
      return [];
    }
    if (addedImageCount === 0 || detail === null) {
      return resolved.changes;
    }
    const existingCount = detail.imagePaths.length;
    return [
      ...resolved.changes.filter(change => change.field !== 'images'),
      {
        field: 'images',
        label: '图片',
        before: `${existingCount} 张`,
        after: `${existingCount + addedImageCount} 张`,
      },
    ];
  }, [addedImageCount, detail, resolved]);

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
        testID="agent-record-update-cancel"
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
          未修改账本。
        </Text>
      </Card>
    );
  }

  if (isError || status.type === 'incomplete') {
    return (
      <StatusCard
        descriptionText="未修改账本，请稍后重试或取消后调整参数。"
        footer={
          approval && approval.approved === undefined ? cancelFooter : undefined
        }
        titleText="修改失败"
      />
    );
  }

  if (result !== undefined) {
    const resultRecordId = getResultRecordId(result);
    return (
      <Card size="small" titleText="已修改" variant="plain">
        <Column gap="small">
          {resolved?.ok ? (
            <RecordSummary draft={resolved.draft} />
          ) : (
            <Text size="sm">记录已更新。</Text>
          )}
          {resultRecordId !== null ? (
            <Text color="tertiary" size="xs">
              {`记录 #${resultRecordId}`}
            </Text>
          ) : null}
        </Column>
      </Card>
    );
  }

  if (approval?.approved === true) {
    return (
      <StatusCard
        descriptionText="已确认，正在更新账本…"
        loading
        titleText="正在修改记录"
      />
    );
  }

  if (!approval) {
    return (
      <StatusCard
        descriptionText="正在准备修改内容…"
        loading
        titleText="正在准备修改"
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

  if (detail === null || metadata === null) {
    return (
      <StatusCard
        descriptionText="正在读取原记录与类型、标签、资产…"
        footer={cancelFooter}
        loading
        titleText="待确认的修改"
      />
    );
  }

  if (!parsed.success || resolved === null || !resolved.ok) {
    const errorText = !parsed.success
      ? '修改参数不完整，请取消后让助手补充。'
      : resolved?.ok === false
        ? resolved.error
        : '修改参数不完整，请取消后让助手补充。';
    return (
      <StatusCard
        descriptionText={errorText}
        footer={
          <Row justify="end">
            <Button
              disabled={responding}
              onPress={() => handleRespond(false, errorText)}
              size="small"
              testID="agent-record-update-cancel"
              type="default"
            >
              取消
            </Button>
          </Row>
        }
        titleText="无法确认这处修改"
      />
    );
  }

  if (changes.length === 0) {
    return (
      <StatusCard
        descriptionText="传入参数与原记录一致，请取消后重新说明要修改的内容。"
        footer={
          <Row justify="end">
            <Button
              disabled={responding}
              onPress={() => handleRespond(false, '没有需要修改的内容')}
              size="small"
              testID="agent-record-update-cancel"
              type="default"
            >
              取消
            </Button>
          </Row>
        }
        titleText="没有需要修改的内容"
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
            testID="agent-record-update-cancel"
            type="default"
          >
            取消
          </Button>
          <Button
            loading={responding}
            onPress={() => handleRespond(true)}
            size="small"
            testID="agent-record-update-confirm"
            type="primary"
          >
            确认修改
          </Button>
        </Row>
      }
      size="small"
      titleText="待确认的修改"
      variant="plain"
    >
      <Column gap="small">
        <Text color="secondary" size="xs">
          {`原记录 #${detail.record.id} · ${
            currentSummary?.category ?? '未知类型'
          } · ${currentSummary?.recordTime ?? ''}`}
        </Text>
        <Column gap="small">
          {changes.map(change => (
            <Row key={change.field} align="start" gap="small">
              <Text color="secondary" size="xs">
                {change.label}
              </Text>
              <Text color="secondary" size="sm">
                {change.before}
              </Text>
              <Text color="tertiary" size="sm">
                →
              </Text>
              <Text size="sm" weight="medium">
                {change.after}
              </Text>
            </Row>
          ))}
        </Column>
        <Text color="warningText" size="xs">
          确认后将更新当前账本
        </Text>
      </Column>
    </Card>
  );
}
