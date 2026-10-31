import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ToolCallMessagePartProps } from '@assistant-ui/react-native';
import {
  Button,
  Card,
  Column,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';

import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import {
  resolveCreateRecordInput,
  type RecordMetadata,
} from '../projection/recordDraft';
import { createRecordInputSchema } from '../tools/createRecord';
import { getErrorMessage } from './errorMessage';
import {
  getResultRecordId,
  RecordSummary,
  StatusCard,
} from './recordCardParts';

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
