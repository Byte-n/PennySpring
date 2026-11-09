import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import { Button, Card, Column, Result, Text, useToast } from '@pennyspring/ui';
import { localApi } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/ui';

import { shareBackupBytes } from '../../features/backup/share';
import {
  DEFAULT_BOOK_CONTENT_OPTIONS,
  formatBytes,
  totalRecords,
} from '../../features/transfer';
import {
  exportBooksToFile,
  type SavedExportResult,
} from '../../features/transfer/operations';
import type { BookContentOptions } from '../../features/transfer/types';
import { BackupContentSelector } from './components/BackupContentSelector';
import { useNavigation } from '../../navigation';
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore';
import { useBookStore } from '../../stores/bookStore';

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    gap: token.marginSM,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  note: {
    gap: token.marginXXS,
  },
  error: {
    paddingHorizontal: token.paddingXXS,
  },
  resultActions: {
    gap: token.marginXS,
    width: '100%',
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '导出失败';
}

export function BackupExportScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const toast = useToast();
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const addHistory = useBackupHistoryStore(state => state.addEntry);
  const {
    data,
    error: booksError,
    loading,
    refresh: refreshBooks,
  } = useRequest(() => localApi.book.getAll());
  const books = data ?? [];

  const [selectedIds, setSelectedIds] = useState<number[] | null>(null);
  const [bookOptions, setBookOptions] = useState<
    Record<number, BookContentOptions>
  >({});
  const [includeSettings, setIncludeSettings] = useState(false);
  const [includeNetworkBooks, setIncludeNetworkBooks] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [saved, setSaved] = useState<SavedExportResult | null>(null);

  useEffect(() => {
    if (selectedIds !== null || books.length === 0) return;
    const currentId =
      currentBookRef?.kind === 'local' ? currentBookRef.id : books[0]?.id;
    setSelectedIds(currentId ? [currentId] : []);
  }, [books, currentBookRef, selectedIds]);

  const selectedBooks = useMemo(
    () => books.filter(book => selectedIds?.includes(book.id) ?? false),
    [books, selectedIds],
  );

  const handleExport = useCallback(async () => {
    if (busy) return;
    const bookIds = selectedIds ?? [];
    if (bookIds.length === 0 && !includeSettings && !includeNetworkBooks) {
      return;
    }
    setBusy(true);
    setErrorText('');
    try {
      const result = await exportBooksToFile({
        bookIds,
        bookOptions: Object.fromEntries(
          bookIds.map(bookId => [
            bookId,
            bookOptions[bookId] ?? DEFAULT_BOOK_CONTENT_OPTIONS,
          ]),
        ),
        includeSettings,
        includeNetworkBooks,
      });
      addHistory({
        id: createBackupHistoryId(),
        kind: 'export',
        fileName: result.fileName,
        sizeBytes: result.sizeBytes,
        createdAt: Date.now(),
        bookNames: result.manifest.books.map(book => book.name),
        recordCount: totalRecords(result.manifest),
        uri: result.savedUri,
        status: 'success',
        errorText: '',
      });
      setSaved(result);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [
    addHistory,
    bookOptions,
    busy,
    includeNetworkBooks,
    includeSettings,
    selectedIds,
  ]);

  const handleShare = useCallback(async (): Promise<void> => {
    if (!saved || sharing) return;
    setSharing(true);
    try {
      await shareBackupBytes(saved.zip, saved.fileName);
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error), status: 'error' });
    } finally {
      setSharing(false);
    }
  }, [saved, sharing, toast]);

  if (saved) {
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled
        style={styles.container}
      >
        <Result
          status="success"
          titleText="备份已保存"
          subtitleText={`${saved.fileName} · ${formatBytes(saved.sizeBytes)}`}
          extra={
            <Column style={styles.resultActions}>
              <Button
                block
                loading={sharing}
                onPress={handleShare}
                type="dashed"
              >
                分享备份
              </Button>
              <Button block onPress={() => navigation.goBack()} type="primary">
                完成
              </Button>
            </Column>
          }
        />
      </ScrollView>
    );
  }

  const canExport =
    ((selectedIds?.length ?? 0) > 0 ||
      includeSettings ||
      includeNetworkBooks) &&
    !busy;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      scrollEnabled
      style={styles.container}
    >
      <BackupContentSelector
        bookOptions={bookOptions}
        books={books}
        defaultBookOptions={DEFAULT_BOOK_CONTENT_OPTIONS}
        error={Boolean(booksError)}
        includeNetworkBooks={includeNetworkBooks}
        includeSettings={includeSettings}
        loading={loading}
        onBookOptionsChange={(bookId, options) =>
          setBookOptions(current => ({ ...current, [bookId]: options }))
        }
        onIncludeNetworkBooksChange={setIncludeNetworkBooks}
        onIncludeSettingsChange={setIncludeSettings}
        onRetry={refreshBooks}
        onSelectedBookIdsChange={setSelectedIds}
        selectedBookIds={selectedIds ?? []}
      />

      <Card titleText="安全边界">
        <Column style={styles.note}>
          <Text color="secondary" size="sm">
            勾选 AI 设置会写入当前账本的 API
            Key；勾选网络账本列表会写入服务器地址与访问令牌。
          </Text>
          <Text color="tertiary" size="xs">
            导入时会新建账本，并恢复包内包含的 AI 设置、系统设置与网络账本列表。
          </Text>
        </Column>
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm" style={styles.error}>
          {errorText}
        </Text>
      ) : null}

      <Button
        block
        disabled={!canExport}
        loading={busy}
        onPress={handleExport}
        type="primary"
      >
        保存到文件
      </Button>
      <Text color="tertiary" size="xs" style={styles.error}>
        已选择 {selectedBooks.length} 个账本
        {includeSettings ? ' · 设置包' : ''}
        {includeNetworkBooks ? ' · 网络账本列表' : ''}
      </Text>
    </ScrollView>
  );
}
