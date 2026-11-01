import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Card,
  Column,
  Empty,
  Result,
  Row,
  Text,
  createUseSheetStyle,
  useToast,
} from '@pennyspring/ui';
import type { ApplyAiConfigResult } from '@pennyspring/api';

import {
  EMPTY_AGENT_SELECTION,
  useProviderSelection,
  useProviders,
  useQuickBookSelection,
} from '../../agent/providers/useProviders';
import { getProviderDisplayName } from '../../agent/providers/display';
import { shareBackupBytes } from '../../features/backup/share';
import {
  exportAiConfigToFile,
  importAiConfig,
  pickAiConfigPreview,
  type AiConfigExportResult,
  type PickedAiConfigPreview,
} from '../../features/transfer/aiConfigOperations';
import { formatBytes } from '../../features/transfer';
import {
  createBackupHistoryId,
  useBackupHistoryStore,
} from '../../stores/backupHistoryStore';
import { useGlobalApi, useBookStore } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';

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
  rowText: {
    flex: 1,
    gap: token.marginXXS,
  },
  actions: {
    gap: token.marginXS,
  },
  hint: {
    gap: token.marginXXS,
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败';
}

function formatSelection(
  providers: ReturnType<typeof useProviders>['data'],
  selection: { providerId: number; modelId: string },
): string {
  if (selection.providerId === 0) return '未选择';
  const provider = providers?.find(item => item.id === selection.providerId);
  const providerName = provider
    ? getProviderDisplayName(provider)
    : `#${selection.providerId}`;
  return `${providerName} / ${selection.modelId || '未选择模型'}`;
}

export function BackupAiConfigScreen() {
  const styles = useStyles();
  const toast = useToast();
  const api = useGlobalApi();
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const bumpProviderVersion = useSyncVersionStore(
    state => state.bumpProviderVersion,
  );
  const addHistory = useBackupHistoryStore(state => state.addEntry);
  const { data: providers = [], refresh: refreshProviders } = useProviders();
  const { data: agentSelection = EMPTY_AGENT_SELECTION } =
    useProviderSelection();
  const { data: quickBookSelection = EMPTY_AGENT_SELECTION } =
    useQuickBookSelection();

  const [busy, setBusy] = useState(false);
  const [exported, setExported] = useState<AiConfigExportResult | null>(null);
  const [preview, setPreview] = useState<PickedAiConfigPreview | null>(null);
  const [importResult, setImportResult] = useState<ApplyAiConfigResult | null>(
    null,
  );
  const [errorText, setErrorText] = useState('');

  const serviceLabel =
    currentBookRef?.kind === 'remote' ? '当前网络账本所在服务器' : '本地服务';

  const previewSelection = useMemo(() => {
    if (!preview) return '';
    const { agentSelection: agent, quickBookSelection: quickBook } =
      preview.parsed.snapshot;
    return `Agent：#${agent.providerId > 0 ? agent.providerId : '-'} / ${agent.modelId || '-'}；快捷记账：#${quickBook.providerId > 0 ? quickBook.providerId : '-'} / ${quickBook.modelId || '-'}`;
  }, [preview]);

  const handleExport = useCallback(async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const result = await exportAiConfigToFile(api);
      setExported(result);
      addHistory({
        id: createBackupHistoryId(),
        kind: 'ai-config-export',
        fileName: result.fileName,
        sizeBytes: result.sizeBytes,
        createdAt: Date.now(),
        bookNames: [],
        recordCount: 0,
        uri: result.savedUri,
        status: 'success',
        errorText: '',
      });
      toast.show({ messageText: 'AI 配置包已保存', status: 'success' });
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [addHistory, api, busy, toast]);

  const handleShareExport = useCallback(async (): Promise<void> => {
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
    setImportResult(null);
    try {
      const picked = await pickAiConfigPreview();
      if (picked) setPreview(picked);
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const handleImport = useCallback(async (): Promise<void> => {
    if (!preview || busy) return;
    setBusy(true);
    setErrorText('');
    try {
      const result = await importAiConfig(api, preview.parsed.snapshot);
      setImportResult(result);
      bumpProviderVersion();
      addHistory({
        id: createBackupHistoryId(),
        kind: 'ai-config-import',
        fileName: preview.sourceName,
        sizeBytes: preview.sizeBytes,
        createdAt: Date.now(),
        bookNames: [],
        recordCount: 0,
        uri: '',
        status: 'success',
        errorText: '',
      });
      refreshProviders();
      toast.show({ messageText: 'AI 配置已导入', status: 'success' });
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }, [
    addHistory,
    api,
    bumpProviderVersion,
    busy,
    preview,
    refreshProviders,
    toast,
  ]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Card
        titleText="当前配置"
        extra={
          <Text color="tertiary" size="xs">
            {serviceLabel}
          </Text>
        }
      >
        <Column style={styles.section}>
          <Row align="center" justify="between" gap="small">
            <Text size="sm" color="secondary">
              提供商
            </Text>
            <Text size="sm">{providers.length} 个</Text>
          </Row>
          <Row align="center" justify="between" gap="small">
            <Text size="sm" color="secondary">
              Agent 默认模型
            </Text>
            <Text size="sm">{formatSelection(providers, agentSelection)}</Text>
          </Row>
          <Row align="center" justify="between" gap="small">
            <Text size="sm" color="secondary">
              快捷记账模型
            </Text>
            <Text size="sm">
              {formatSelection(providers, quickBookSelection)}
            </Text>
          </Row>
          <Text color="tertiary" size="xs">
            API Key 不属于 AI 配置包，导出和导入都不会包含 Key。
          </Text>
        </Column>
      </Card>

      <Card titleText="导出 AI 配置">
        <Column style={styles.section}>
          <Text color="secondary" size="sm">
            导出提供商定义、Agent 与快捷记账的模型选择。新设备导入后需要重新配置
            API Key。
          </Text>
          {exported ? (
            <Column style={styles.section}>
              <Text weight="semibold">{exported.fileName}</Text>
              <Text color="secondary" size="sm">
                {exported.snapshot.providers.length} 个提供商 ·{' '}
                {formatBytes(exported.sizeBytes)}
              </Text>
              <Row gap="small">
                <Button onPress={handleShareExport} size="small" type="dashed">
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
              保存 AI 配置包
            </Button>
          )}
        </Column>
      </Card>

      <Card titleText="导入 AI 配置">
        {importResult ? (
          <Column style={styles.section}>
            <Result
              size="small"
              status="success"
              titleText="导入完成"
              subtitleText={`新增 ${importResult.providersCreated} 个，更新 ${importResult.providersUpdated} 个提供商；重映射 ${importResult.threadsUpdated} 个会话`}
            />
            <Text color="secondary" size="sm">
              新导入的提供商如果还没有 API Key，请到「AI 提供商」中补充。
            </Text>
            <Button onPress={() => setImportResult(null)} type="dashed">
              再导入一个
            </Button>
          </Column>
        ) : preview ? (
          <Column style={styles.section}>
            <Text weight="semibold">{preview.sourceName}</Text>
            <Text color="secondary" size="sm">
              {preview.parsed.snapshot.providers.length} 个提供商 ·{' '}
              {formatBytes(preview.sizeBytes)}
            </Text>
            <Text color="secondary" size="sm">
              {previewSelection}
            </Text>
            <Column style={styles.hint}>
              <Text color="secondary" size="sm">
                同名同地址同类型的提供商会更新，其余新建；不会删除现有提供商，也不会覆盖
                API Key。
              </Text>
              <Text color="tertiary" size="xs">
                导入会替换当前 Agent 与快捷记账的模型选择。
              </Text>
            </Column>
            <Button block loading={busy} onPress={handleImport} type="primary">
              导入 AI 配置
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
                选择 .psa 配置包
              </Button>
            }
            descriptionText="选择 AI 配置包，先预览再导入。"
            titleText="还没有选择 AI 配置包"
            variant="boxed"
          />
        )}
      </Card>

      {errorText ? (
        <Text color="errorText" size="sm">
          {errorText}
        </Text>
      ) : null}
    </ScrollView>
  );
}
