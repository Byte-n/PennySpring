import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Card,
  Column,
  Empty,
  Result,
  Row,
  Text,
} from '@pennyspring/ui';
import {
  BOOK_TYPE,
  localApi,
  type ApplyLibrarySnapshotResult,
} from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/ui';

import { formatBytes, totalRecords } from '../../features/transfer';
import {
  importPackage,
  pickPackagePreview,
  type PickedPackagePreview,
} from '../../features/transfer/operations';
import { ROOT_ROUTES, useNavigation } from '../../navigation';
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
  cardContent: {
    gap: token.marginSM,
  },
  bookRow: {
    gap: token.marginXXS,
    paddingVertical: token.paddingXXS,
  },
  note: {
    gap: token.marginXXS,
  },
  error: {
    paddingHorizontal: token.paddingXXS,
  },
  actions: {
    gap: token.marginXS,
    width: '100%',
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '导入失败';
}

export function BackupImportScreen() {
  const styles = useStyles();
  const navigation = useNavigation();
  const addHistory = useBackupHistoryStore(state => state.addEntry);
  const [preview, setPreview] = useState<PickedPackagePreview | null>(null);
  const [result, setResult] = useState<ApplyLibrarySnapshotResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handlePick = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const picked = await pickPackagePreview();
      if (picked) setPreview(picked);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const handleImport = useCallback(async () => {
    if (!preview || busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const imported = await importPackage(preview.parsed);
      addHistory({
        id: createBackupHistoryId(),
        kind: 'import',
        fileName: preview.sourceName,
        sizeBytes: preview.sizeBytes,
        createdAt: Date.now(),
        bookNames: preview.parsed.manifest.books.map(book => book.name),
        recordCount: totalRecords(preview.parsed.manifest),
        uri: '',
        status: 'success',
        errorText: '',
      });
      setResult(imported.result);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [addHistory, busy, preview]);

  const openImportedBook = useCallback(async () => {
    if (!result?.books[0]) {
      navigation.navigate(ROOT_ROUTES.Home);
      return;
    }
    try {
      const book = await localApi.book.getById(result.books[0].bookId);
      useBookStore
        .getState()
        .setCurrentBook(
          { kind: 'local', id: book.id },
          { kind: BOOK_TYPE.local, ...book },
        );
      navigation.navigate(ROOT_ROUTES.Home);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    }
  }, [navigation, result]);

  if (result) {
    const records = result.books.reduce(
      (sum, book) => sum + book.counts.records,
      0,
    );
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled
        style={styles.container}
      >
        <Result
          status="success"
          titleText="导入完成"
          subtitleText={`${result.books.length} 个账本已创建 · ${records.toLocaleString('zh-CN')} 条流水`}
          extra={
            <Column style={styles.actions}>
              <Button block onPress={openImportedBook} type="primary">
                打开导入的账本
              </Button>
              <Button
                block
                onPress={() => navigation.navigate(ROOT_ROUTES.Home)}
                type="dashed"
              >
                完成
              </Button>
            </Column>
          }
        />
      </ScrollView>
    );
  }

  if (!preview) {
    return (
      <ScrollView
        contentContainerStyle={styles.content}
        scrollEnabled
        style={styles.container}
      >
        <Card>
          <Empty
            variant="boxed"
            titleText="还没有选择备份"
            descriptionText="选择 .psb 备份文件，先预览再导入。"
            action={
              <Button
                loading={busy}
                onPress={handlePick}
                size="small"
                type="primary"
              >
                选择备份文件
              </Button>
            }
          />
        </Card>
        {errorText ? (
          <Text color="errorText" size="sm" style={styles.error}>
            {errorText}
          </Text>
        ) : null}
      </ScrollView>
    );
  }

  const { manifest } = preview.parsed;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      scrollEnabled
      style={styles.container}
    >
      <Card
        titleText="备份文件"
        extra={
          <Text color="tertiary" size="xs">
            格式 v{manifest.formatVersion}
          </Text>
        }
      >
        <Column style={styles.cardContent}>
          <Text weight="semibold">{preview.sourceName}</Text>
          <Text color="secondary" size="sm">
            {formatBytes(preview.sizeBytes)} · {manifest.books.length} 个账本 ·{' '}
            {totalRecords(manifest).toLocaleString('zh-CN')} 条流水
          </Text>
        </Column>
      </Card>

      <Card titleText="将创建的账本">
        <Column style={styles.cardContent}>
          {manifest.books.map(book => (
            <Column key={book.key} style={styles.bookRow}>
              <Text>{book.name}</Text>
              <Text color="secondary" size="sm">
                {book.counts.records.toLocaleString('zh-CN')} 条流水 ·{' '}
                {book.counts.assets} 个资产 · {book.counts.images} 张图片
              </Text>
            </Column>
          ))}
        </Column>
      </Card>

      <Card titleText="包含与排除">
        <Column style={styles.note}>
          <Row justify="between" gap="small">
            <Text size="sm" color="secondary">
              图片附件
            </Text>
            <Text size="sm">
              {manifest.options.includeImages ? '包含' : '不包含'}
            </Text>
          </Row>
          <Row justify="between" gap="small">
            <Text size="sm" color="secondary">
              AI 会话
            </Text>
            <Text size="sm">
              {manifest.options.includeAgent ? '包含' : '不包含'}
            </Text>
          </Row>
          <Text size="sm" color="tertiary">
            API Key、AI 提供商配置、服务器连接信息不在备份中。
          </Text>
        </Column>
      </Card>

      <Card titleText="导入规则">
        <Text size="sm" color="secondary">
          会新建账本，不会覆盖或合并现有数据；原设备后续修改不会自动同步。
        </Text>
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm" style={styles.error}>
          {errorText}
        </Text>
      ) : null}

      <Button block loading={busy} onPress={handleImport} type="primary">
        导入为新账本
      </Button>
      <Button block disabled={busy} onPress={handlePick} type="dashed">
        重新选择文件
      </Button>
    </ScrollView>
  );
}
