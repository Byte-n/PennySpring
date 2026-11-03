import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Card,
  Column,
  Empty,
  Row,
  Text,
  createUseSheetStyle,
  useToast,
} from '@pennyspring/ui';

import { shareBackupBytes } from '../../features/backup/share';
import { formatBytes } from '../../features/transfer';
import {
  applyNetworkBooksSnapshot,
  exportNetworkBooksToFile,
  pickNetworkBooksPreview,
  type PickedNetworkBooksPreview,
  type SavedNetworkBooksExportResult,
} from '../../features/transfer/networkBooksOperations';
import { ROOT_ROUTES, useNavigation } from '../../navigation';
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore';
import { useNetworkBookStore } from '../../stores/networkBookStore';

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
  section: {
    gap: token.marginSM,
  },
  server: {
    gap: token.marginXXS,
  },
  hint: {
    gap: token.marginXXS,
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败';
}

export function BackupNetworkBooksScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const refs = useNetworkBookStore(state => state.refs);
  const tokens = useNetworkBookStore(state => state.tokens);
  const addHistory = useBackupHistoryStore(state => state.addEntry);

  const [busy, setBusy] = useState(false);
  const [exported, setExported] =
    useState<SavedNetworkBooksExportResult | null>(null);
  const [preview, setPreview] = useState<PickedNetworkBooksPreview | null>(
    null,
  );
  const [errorText, setErrorText] = useState('');

  const servers = useMemo(() => {
    const urls = Array.from(
      new Set([...Object.keys(tokens), ...refs.map(ref => ref.serverUrl)]),
    );
    return urls.map(serverUrl => ({
      serverUrl,
      hasToken: Boolean(tokens[serverUrl]),
      bookCount: refs.filter(ref => ref.serverUrl === serverUrl).length,
    }));
  }, [refs, tokens]);

  const handleExport = useCallback(async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const result = await exportNetworkBooksToFile();
      setExported(result);
      addHistory({
        id: createBackupHistoryId(),
        kind: 'network-books-export',
        fileName: result.fileName,
        sizeBytes: result.sizeBytes,
        createdAt: Date.now(),
        bookNames: [],
        recordCount: 0,
        uri: result.savedUri,
        status: 'success',
        errorText: '',
      });
      toast.show({ messageText: '网络账本列表已保存', status: 'success' });
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [addHistory, busy, toast]);

  const handleShare = useCallback(async (): Promise<void> => {
    if (!exported) return;
    try {
      await shareBackupBytes(exported.zip, exported.fileName);
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error), status: 'error' });
    }
  }, [exported, toast]);

  const handlePick = useCallback(async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const picked = await pickNetworkBooksPreview();
      if (picked) setPreview(picked);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const handleImport = useCallback((): void => {
    if (!preview || busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const result = applyNetworkBooksSnapshot(preview.parsed.snapshot);
      addHistory({
        id: createBackupHistoryId(),
        kind: 'network-books-import',
        fileName: preview.sourceName,
        sizeBytes: preview.sizeBytes,
        createdAt: Date.now(),
        bookNames: [],
        recordCount: 0,
        uri: '',
        status: 'success',
        errorText: '',
      });
      toast.show({
        messageText: `已合并 ${result.serversAdded} 个服务器 · ${result.refsAdded} 个账本`,
        status: 'success',
      });
      setPreview(null);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [addHistory, busy, preview, toast]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Card titleText="当前网络账本">
        {servers.length === 0 ? (
          <Text color="secondary" size="sm">
            还没有网络账本。
          </Text>
        ) : (
          <Column style={styles.section}>
            {servers.map(server => (
              <Column key={server.serverUrl} style={styles.server}>
                <Text size="sm">{server.serverUrl}</Text>
                <Text color="secondary" size="xs">
                  {server.bookCount} 个账本 ·{' '}
                  {server.hasToken ? '已保存访问令牌' : '未保存访问令牌'}
                </Text>
              </Column>
            ))}
          </Column>
        )}
        <Text color="tertiary" size="xs">
          列表包包含服务器地址、账本引用与访问令牌，请妥善保管。
        </Text>
      </Card>

      <Card titleText="导出列表">
        <Column style={styles.section}>
          <Text color="secondary" size="sm">
            保存为 .psn 列表包，可在另一台设备导入合并。
          </Text>
          {exported ? (
            <Column style={styles.section}>
              <Text weight="semibold">{exported.fileName}</Text>
              <Text color="secondary" size="sm">
                {exported.manifest.serverCount} 个服务器 ·{' '}
                {exported.manifest.bookCount} 个账本 ·{' '}
                {formatBytes(exported.sizeBytes)}
              </Text>
              <Row gap="small">
                <Button onPress={handleShare} size="small" type="dashed">
                  分享
                </Button>
                <Button
                  onPress={() => setExported(null)}
                  size="small"
                  type="text"
                >
                  继续导出
                </Button>
              </Row>
            </Column>
          ) : (
            <Button loading={busy} onPress={handleExport} type="primary">
              保存网络账本列表
            </Button>
          )}
        </Column>
      </Card>

      <Card titleText="导入列表">
        {preview ? (
          <Column style={styles.section}>
            <Text weight="semibold">{preview.sourceName}</Text>
            <Text color="secondary" size="sm">
              {preview.parsed.manifest.serverCount} 个服务器 ·{' '}
              {preview.parsed.manifest.bookCount} 个账本 ·{' '}
              {formatBytes(preview.sizeBytes)}
            </Text>
            <Column style={styles.hint}>
              <Text color="secondary" size="sm">
                导入会合并服务器、访问令牌与账本引用，不删除本机已有项。
              </Text>
            </Column>
            <Button block loading={busy} onPress={handleImport} type="primary">
              合并到本机
            </Button>
            <Button block disabled={busy} onPress={handlePick} type="dashed">
              重新选择文件
            </Button>
          </Column>
        ) : (
          <Empty
            action={
              <Button
                loading={busy}
                onPress={handlePick}
                size="small"
                type="primary"
              >
                选择 .psn 列表包
              </Button>
            }
            descriptionText="选择网络账本列表包，先预览再合并。"
            titleText="还没有选择列表包"
            variant="boxed"
          />
        )}
      </Card>

      <Card titleText="局域网传输">
        <Column style={styles.section}>
          <Text color="secondary" size="sm">
            在局域网传输中勾选「网络账本列表」即可同步到另一台设备，内容选项与自动备份一致。
          </Text>
          <Button
            block
            onPress={() => navigation.navigate(ROOT_ROUTES.BackupLan)}
            type="dashed"
          >
            打开局域网传输
          </Button>
        </Column>
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm">
          {errorText}
        </Text>
      ) : null}
    </ScrollView>
  );
}
