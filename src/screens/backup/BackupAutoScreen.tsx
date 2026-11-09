import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useRequest } from 'ahooks';
import {
  ActionSheet,
  Button,
  Card,
  Column,
  Input,
  Row,
  Text,
  createUseSheetStyle,
  useToast,
} from '@pennyspring/ui';
import { localApi } from '@pennyspring/api';

import {
  clampCustomDays,
  rehydrateAutoBackup,
  useAutoBackupStore,
  type AutoBackupFrequency,
} from '../../features/backup/autoBackupStore';
import { runAutoBackup } from '../../features/backup/autoBackupRunner';
import {
  describeDirectoryTarget,
  isCustomDirectorySupported,
  pickBackupDirectory,
} from '../../features/backup/directory';
import { BackupContentSelector } from './components/BackupContentSelector';

const FREQUENCIES: Array<{ value: AutoBackupFrequency; label: string }> = [
  { value: 'off', label: '关闭' },
  { value: 'everyLaunch', label: '每次进入应用' },
  { value: 'daily', label: '每天第一次进入' },
  { value: 'weekly', label: '每周第一次进入' },
  { value: 'monthly', label: '每月第一次进入' },
  { value: 'customDays', label: '自定义天数' },
];

const STATUS_LABELS: Record<string, string> = {
  success: '成功',
  failed: '失败',
  skipped: '已跳过',
  '': '尚未运行',
};

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
  bookText: {
    flex: 1,
    gap: token.marginXXS,
  },
  hint: {
    paddingTop: token.paddingXXS,
  },
  actions: {
    gap: token.marginXS,
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败';
}

export function BackupAutoScreen() {
  const styles = useStyles();
  const toast = useToast();
  const settings = useAutoBackupStore();
  const {
    data,
    error: booksError,
    loading,
    refresh: refreshBooks,
  } = useRequest(() => localApi.book.getAll());
  const books = data ?? [];
  const customDirectorySupported = isCustomDirectorySupported();

  const [frequencySheetOpen, setFrequencySheetOpen] = useState(false);
  const [customDaysText, setCustomDaysText] = useState(
    String(settings.customDays),
  );
  const [retentionText, setRetentionText] = useState(
    settings.retention === null ? '0' : String(settings.retention),
  );
  const [directoryBusy, setDirectoryBusy] = useState(false);
  const [runBusy, setRunBusy] = useState(false);

  useEffect(() => {
    rehydrateAutoBackup().catch(() => undefined);
  }, []);

  useEffect(() => {
    setCustomDaysText(String(settings.customDays));
  }, [settings.customDays]);

  useEffect(() => {
    setRetentionText(
      settings.retention === null ? '0' : String(settings.retention),
    );
  }, [settings.retention]);

  const frequencyLabel = useMemo(
    () =>
      FREQUENCIES.find(item => item.value === settings.frequency)?.label ??
      '关闭',
    [settings.frequency],
  );
  const frequencyActions = useMemo(
    () => FREQUENCIES.map(item => ({ text: item.label })),
    [],
  );
  const selectedBookIds =
    settings.selectedBookIds ?? books.map(book => book.id);

  const handleFrequencyAction = useCallback(
    (_action: unknown, index: number): void => {
      const item = FREQUENCIES[index];
      if (item) settings.setFrequency(item.value);
    },
    [settings],
  );

  const commitCustomDays = useCallback((): void => {
    const days = clampCustomDays(Number(customDaysText));
    settings.setCustomDays(days);
    setCustomDaysText(String(days));
  }, [customDaysText, settings]);

  const commitRetention = useCallback((): void => {
    const parsed = Number(retentionText);
    const retention =
      Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
    settings.setRetention(retention);
    setRetentionText(retention === null ? '0' : String(retention));
  }, [retentionText, settings]);

  const handlePickDirectory = useCallback(async (): Promise<void> => {
    if (directoryBusy) return;
    setDirectoryBusy(true);
    try {
      const target = await pickBackupDirectory();
      if (target) settings.setDirectory(target);
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error), status: 'error' });
    } finally {
      setDirectoryBusy(false);
    }
  }, [directoryBusy, settings, toast]);

  const handleRunNow = useCallback(async (): Promise<void> => {
    if (runBusy) return;
    setRunBusy(true);
    try {
      const result = await runAutoBackup();
      if (result.status === 'success') {
        toast.show({
          messageText: result.errorText
            ? `备份完成，但${result.errorText}`
            : `已生成 ${result.fileName}`,
          status: result.errorText ? 'default' : 'success',
        });
      } else {
        toast.show({
          messageText: result.errorText || '自动备份已跳过',
          status: result.status === 'failed' ? 'error' : 'default',
        });
      }
    } catch (error: unknown) {
      toast.show({ messageText: getErrorMessage(error), status: 'error' });
    } finally {
      setRunBusy(false);
    }
  }, [runBusy, toast]);

  const lastRunText =
    settings.lastRunAt > 0
      ? `${new Date(settings.lastRunAt).toLocaleString('zh-CN')} · ${STATUS_LABELS[settings.lastRunStatus] ?? settings.lastRunStatus}`
      : '尚未运行';

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card titleText="触发条件">
          <Column style={styles.section}>
            <Row align="center" justify="between">
              <Text size="sm">备份频率</Text>
              <Button
                onPress={() => setFrequencySheetOpen(true)}
                size="small"
                type="text"
              >
                {frequencyLabel}
              </Button>
            </Row>
            {settings.frequency === 'customDays' ? (
              <Input
                keyboardType="number-pad"
                labelText="间隔天数"
                onBlur={commitCustomDays}
                onChange={setCustomDaysText}
                suffix={
                  <Text color="secondary" size="sm">
                    天
                  </Text>
                }
                value={customDaysText}
              />
            ) : null}
            <Text color="tertiary" size="xs">
              每次进入应用指每次切回前台；其余模式在对应周期的第一次进入时执行。
            </Text>
          </Column>
        </Card>

        <BackupContentSelector
          bookOptions={settings.bookOptions}
          books={books}
          defaultBookOptions={settings.defaultBookOptions}
          error={Boolean(booksError)}
          includeNetworkBooks={settings.includeNetworkBooks}
          includeSettings={settings.includeSettings}
          loading={loading}
          onBookOptionsChange={settings.setBookOptions}
          onIncludeNetworkBooksChange={settings.setIncludeNetworkBooks}
          onIncludeSettingsChange={settings.setIncludeSettings}
          onRetry={refreshBooks}
          onSelectedBookIdsChange={ids =>
            settings.setSelectedBookIds(
              ids.length === books.length && books.length > 0 ? null : ids,
            )
          }
          selectedBookIds={selectedBookIds}
          showSelectAll
        />

        <Card titleText="保存位置">
          <Column style={styles.section}>
            <Row align="center" justify="between" gap="small">
              <Column style={styles.bookText}>
                <Text>备份目录</Text>
                <Text color="secondary" size="sm">
                  {settings.directory
                    ? describeDirectoryTarget(settings.directory)
                    : '应用私有目录 backups'}
                </Text>
              </Column>
              <Button
                disabled={!customDirectorySupported}
                loading={directoryBusy}
                onPress={handlePickDirectory}
                size="small"
                type="text"
              >
                选择目录
              </Button>
            </Row>
            {settings.directory ? (
              <Button
                onPress={() => settings.setDirectory(null)}
                size="small"
                type="dashed"
              >
                恢复为应用私有目录
              </Button>
            ) : null}
            {!customDirectorySupported ? (
              <Text color="tertiary" size="xs">
                当前安装包不支持自定义目录；重新构建应用后可用。
              </Text>
            ) : null}
            <Input
              keyboardType="number-pad"
              labelText="保留数量"
              onBlur={commitRetention}
              onChange={setRetentionText}
              suffix={
                <Text color="secondary" size="sm">
                  份
                </Text>
              }
              value={retentionText}
            />
            <Text color="tertiary" size="xs">
              只清理 auto- 开头的自动备份文件；0
              表示不限制。手动导出的文件不会删除。
            </Text>
          </Column>
        </Card>

        <Card titleText="运行状态">
          <Column style={styles.section}>
            <Text size="sm">最近运行：{lastRunText}</Text>
            {settings.lastFileName ? (
              <Text color="secondary" size="sm">
                {settings.lastFileName}
              </Text>
            ) : null}
            {settings.lastRunError ? (
              <Text color="errorText" size="sm">
                {settings.lastRunError}
              </Text>
            ) : null}
            <Button loading={runBusy} onPress={handleRunNow} type="primary">
              立即备份一次
            </Button>
          </Column>
        </Card>
      </ScrollView>

      <ActionSheet
        actions={frequencyActions}
        onAction={handleFrequencyAction}
        onOpenChange={setFrequencySheetOpen}
        open={frequencySheetOpen}
        titleText="自动备份频率"
      />
    </Column>
  );
}
