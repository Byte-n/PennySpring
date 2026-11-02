import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import type { RecordDetail } from '@pennyspring/api';
import { Button, Card, Column, Row, Text, useToast } from '@pennyspring/ui';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import type { RecordMetadata } from '../projection/recordDraft';
import {
  resolveUpdateRecordInput,
  type RecordChange,
} from '../projection/recordUpdateDraft';
import { updateRecordsInputSchema } from '../tools/updateRecords';
import { getErrorMessage } from './errorMessage';
import {
  formatRecordTimeCompact,
  formatYuan,
  RecordBatchRow,
  type RecordBatchRowDetail,
  StatusCard,
} from './recordCardParts';

interface ResolvedUpdateSuccess {
  ok: true;
  detail: RecordDetail;
  changes: RecordChange[];
  categoryLabel: string;
  typePath: string;
  amountCents: number;
  recordTime: number;
}

interface ResolvedUpdateFailure {
  ok: false;
  error: string;
}

type ResolvedUpdateItem = ResolvedUpdateSuccess | ResolvedUpdateFailure;

function formatChangeSummary(changes: readonly RecordChange[]): string {
  if (changes.length > 2) {
    return `${changes.length} 项修改`;
  }
  return changes.map(change => change.label).join('、');
}

function buildChangeDetails(
  changes: readonly RecordChange[],
): RecordBatchRowDetail[] {
  return changes.map(change => ({
    label: change.label,
    value: `${change.before} → ${change.after}`,
  }));
}

function appendImageChange(
  changes: readonly RecordChange[],
  existingCount: number,
  addedCount: number,
): RecordChange[] {
  if (addedCount === 0) {
    return [...changes];
  }
  return [
    ...changes.filter(change => change.field !== 'images'),
    {
      field: 'images',
      label: '图片',
      before: `${existingCount} 张`,
      after: `${existingCount + addedCount} 张`,
    },
  ];
}

export function RecordUpdateCard(
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
    () => updateRecordsInputSchema.safeParse(args),
    [args],
  );
  const recordIds = useMemo(
    () =>
      parsed.success ? parsed.data.updates.map(item => item.recordId) : [],
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
      setLoadError('修改参数不完整，请取消后让助手补充。');
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
    if (
      bookId === undefined ||
      details === null ||
      metadata === null ||
      !parsed.success
    ) {
      return null;
    }
    return parsed.data.updates.map((update, index): ResolvedUpdateItem => {
      const detail = details[index];
      if (!detail) {
        return {
          ok: false,
          error: `记录 ${update.recordId} 不存在`,
        };
      }
      const updateResult = resolveUpdateRecordInput(
        bookId,
        {
          record: detail.record,
          tagIds: detail.tagIds,
          imagePaths: detail.imagePaths,
        },
        update,
        metadata,
      );
      if (!updateResult.ok) {
        return { ok: false, error: updateResult.error };
      }
      return {
        ok: true,
        detail,
        changes: appendImageChange(
          updateResult.changes,
          detail.imagePaths.length,
          update.attachmentIds?.length ?? 0,
        ),
        categoryLabel: updateResult.draft.categoryLabel,
        typePath: updateResult.draft.typePath,
        amountCents: updateResult.draft.amountCents,
        recordTime: updateResult.draft.recordTime,
      };
    });
  }, [bookId, details, metadata, parsed]);

  const invalidError = useMemo(() => {
    if (!parsed.success) {
      return '修改参数不完整，请取消后让助手补充。';
    }
    if (resolved === null) {
      return '';
    }
    const invalidIndex = resolved.findIndex(
      item => !item.ok || item.changes.length === 0,
    );
    if (invalidIndex < 0) {
      return '';
    }
    const item = resolved[invalidIndex];
    if (!item || !item.ok) {
      return `第 ${invalidIndex + 1} 条：${item?.error ?? '无法确认修改内容'}`;
    }
    return `第 ${invalidIndex + 1} 条：没有需要修改的内容`;
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
    return (
      <Card size="small" titleText="已修改" variant="plain">
        <Text size="sm">
          {`已更新当前账本${resolved?.length ? `，共 ${resolved.length} 条` : ''}。`}
        </Text>
      </Card>
    );
  }

  if (approval?.approved === true) {
    return (
      <StatusCard
        descriptionText="已确认，正在批量更新账本…"
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

  if (details === null || metadata === null) {
    return (
      <StatusCard
        descriptionText="正在读取原记录与类型、标签、资产…"
        footer={cancelFooter}
        loading
        titleText="待确认的修改"
      />
    );
  }

  if (!parsed.success || resolved === null || invalidError) {
    const errorText = !parsed.success
      ? '修改参数不完整，请取消后让助手补充。'
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
              testID="agent-record-update-cancel"
              type="default"
            >
              取消
            </Button>
          </Row>
        }
        titleText="无法确认这批修改"
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
        {resolved.map((item, index) =>
          item.ok ? (
            <RecordBatchRow
              index={index + 1}
              key={`${item.detail.record.id}-${index}`}
              amountText={`¥${formatYuan(item.amountCents)}`}
              details={buildChangeDetails(item.changes)}
              metaText={`#${item.detail.record.id} · ${formatChangeSummary(
                item.changes,
              )} · ${formatRecordTimeCompact(item.recordTime)}`}
              testID={`agent-record-update-item-${index + 1}`}
              title={`${item.categoryLabel} · ${item.typePath}`}
            />
          ) : null,
        )}
        <Text color="warningText" size="xs">
          {`确认后将更新当前账本，共 ${resolved.length} 条`}
        </Text>
      </Column>
    </Card>
  );
}
