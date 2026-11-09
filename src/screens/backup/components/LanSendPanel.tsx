import React from 'react';
import {
  Button,
  Column,
  Row,
  Text,
  createUseSheetStyle,
} from '@pennyspring/ui';
import type { BookRow } from '@pennyspring/api';

import type { BookContentOptions } from '../../../features/transfer/types';
import { BackupContentSelector } from './BackupContentSelector';

interface LanSendPanelProps {
  books: BookRow[];
  error?: boolean;
  loading: boolean;
  onRetry?: () => void;
  selectedBookIds: number[];
  bookOptions: Record<number, BookContentOptions>;
  defaultBookOptions: BookContentOptions;
  includeSettings: boolean;
  includeNetworkBooks: boolean;
  busy: boolean;
  onSelectedBookIdsChange: (bookIds: number[]) => void;
  onBookOptionsChange: (bookId: number, options: BookContentOptions) => void;
  onIncludeSettingsChange: (value: boolean) => void;
  onIncludeNetworkBooksChange: (value: boolean) => void;
  onSend: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  root: {
    gap: token.marginSM,
  },
  summary: {
    paddingHorizontal: token.paddingXXS,
  },
  note: {
    gap: token.marginXXS,
  },
}));

export function LanSendPanel({
  books,
  error = false,
  loading,
  onRetry,
  selectedBookIds,
  bookOptions,
  defaultBookOptions,
  includeSettings,
  includeNetworkBooks,
  busy,
  onSelectedBookIdsChange,
  onBookOptionsChange,
  onIncludeSettingsChange,
  onIncludeNetworkBooksChange,
  onSend,
}: LanSendPanelProps) {
  const styles = useStyles();
  const hasContent =
    selectedBookIds.length > 0 || includeSettings || includeNetworkBooks;

  return (
    <Column style={styles.root}>
      <BackupContentSelector
        bookOptions={bookOptions}
        books={books}
        defaultBookOptions={defaultBookOptions}
        error={error}
        includeNetworkBooks={includeNetworkBooks}
        includeSettings={includeSettings}
        loading={loading}
        onBookOptionsChange={onBookOptionsChange}
        onIncludeNetworkBooksChange={onIncludeNetworkBooksChange}
        onIncludeSettingsChange={onIncludeSettingsChange}
        onRetry={onRetry}
        onSelectedBookIdsChange={onSelectedBookIdsChange}
        selectedBookIds={selectedBookIds}
      />

      <Row justify="between" style={styles.summary}>
        <Text color="tertiary" size="sm">
          已选择
        </Text>
        <Text size="sm" weight="semibold">
          {selectedBookIds.length} 个账本
          {includeSettings ? ' · 设置包' : ''}
          {includeNetworkBooks ? ' · 网络账本列表' : ''}
        </Text>
      </Row>

      <Button
        block
        disabled={busy || !hasContent}
        loading={busy}
        onPress={onSend}
        type="primary"
      >
        发送内容
      </Button>
      <Column style={styles.note}>
        <Text color="tertiary" size="xs">
          对方确认内容范围和大小后才开始传输。
        </Text>
        <Text color="tertiary" size="xs">
          导入会新建账本，并恢复包内包含的 AI 设置与系统设置。
        </Text>
      </Column>
    </Column>
  );
}
