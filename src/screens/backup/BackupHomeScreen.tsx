import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Card,
  Column,
  Row,
  Text,
  createUseSheetStyle,
  useToast,
} from '@pennyspring/ui';

import { runAutoBackup } from '../../features/backup/autoBackupRunner';
import { useAutoBackupStore } from '../../features/backup/autoBackupStore';
import { describeDirectoryTarget } from '../../features/backup/directory';
import { shareBackupFile } from '../../features/backup/share';
import { formatBytes } from '../../features/transfer';
import { ROOT_ROUTES, useNavigation } from '../../navigation';
import {
  useBackupHistoryStore,
  type BackupHistoryEntry,
  type BackupHistoryKind,
} from '../../stores/backupHistoryStore';

const HISTORY_PREVIEW_LIMIT = 5;

const FREQUENCY_LABELS: Record<string, string> = {
  off: '关闭',
  everyLaunch: '每次进入应用',
  daily: '每天第一次进入',
  weekly: '每周第一次进入',
  monthly: '每月第一次进入',
  customDays: '自定义天数',
};

const HISTORY_KIND_LABELS: Record<BackupHistoryKind, string> = {
  export: '导出',
  import: '导入',
  auto: '自动备份',
  'settings-export': '设置包导出',
  'settings-import': '设置包导入',
  'ai-config-export': 'AI 配置导出',
  'ai-config-import': 'AI 配置导入',
  'lan-send': '局域网发送',
  'lan-receive': '局域网接收',
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
  cardContent: {
    gap: token.marginSM,
  },
  historyRow: {
    gap: token.marginXS,
    paddingVertical: token.paddingXXS,
  },
  historyText: {
    flex: 1,
    gap: token.marginXXS,
  },
  actions: {
    gap: token.marginXS,
    paddingTop: token.paddingXXS,
  },
  note: {
    gap: token.marginXXS,
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '操作失败';
}

function formatHistoryMeta(entry: BackupHistoryEntry): string {
  const parts = [HISTORY_KIND_LABELS[entry.kind]];
  if (entry.bookNames.length > 0) parts.push(entry.bookNames.join('、'));
  if (entry.recordCount > 0) {
    parts.push(`${entry.recordCount.toLocaleString('zh-CN')} 条记录`);
  }
  if (entry.sizeBytes > 0) parts.push(formatBytes(entry.sizeBytes));
  return parts.join(' · ');
}

export function BackupHomeScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const entries = useBackupHistoryStore(state => state.entries);
  const clearHistory = useBackupHistoryStore(state => state.clear);
  const settings = useAutoBackupStore();
  const [runBusy, setRunBusy] = useState(false);

  const recentEntries = entries.slice(0, HISTORY_PREVIEW_LIMIT);

  const handleShare = useCallback(
    async (entry: BackupHistoryEntry): Promise<void> => {
      if (!entry.uri) return;
      try {
        await shareBackupFile(entry.uri, entry.fileName);
      } catch (error: unknown) {
        toast.show({ messageText: getErrorMessage(error), status: 'error' });
      }
    },
    [toast],
  );

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
      ? new Date(settings.lastRunAt).toLocaleString('zh-CN')
      : '尚未运行';
  const directoryText = settings.directory
    ? describeDirectoryTarget(settings.directory)
    : '应用私有目录 backups';

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Card
        extra={
          <Text color="tertiary" size="xs">
            {FREQUENCY_LABELS[settings.frequency] ?? '关闭'}
          </Text>
        }
        titleText="自动备份"
        variant="elevated"
      >
        <Column style={styles.cardContent}>
          <Text color="secondary" size="sm">
            最近运行：{lastRunText}
            {settings.lastFileName ? ` · ${settings.lastFileName}` : ''}
          </Text>
          <Text color="tertiary" size="xs">
            保存到：{directoryText}
          </Text>
          {settings.lastRunError ? (
            <Text color="errorText" size="sm">
              {settings.lastRunError}
            </Text>
          ) : null}
          <Row gap="small">
            <Button
              onPress={() => navigation.navigate(ROOT_ROUTES.BackupAuto)}
              size="small"
              type="text"
            >
              设置
            </Button>
            <Button
              loading={runBusy}
              onPress={handleRunNow}
              size="small"
              type="dashed"
            >
              立即备份
            </Button>
          </Row>
        </Column>
      </Card>

      <Card
        extra={
          entries.length > 0 ? (
            <Button onPress={clearHistory} size="small" type="text">
              清空
            </Button>
          ) : null
        }
        titleText="备份历史"
      >
        {recentEntries.length === 0 ? (
          <Text color="secondary" size="sm">
            还没有备份记录。导出、导入或自动备份后会在这里留下记录。
          </Text>
        ) : (
          <Column>
            {recentEntries.map(entry => (
              <Row
                align="center"
                gap="small"
                justify="between"
                key={entry.id}
                style={styles.historyRow}
              >
                <Column style={styles.historyText}>
                  <Text size="sm">{entry.fileName || '备份失败'}</Text>
                  <Text color="secondary" size="xs">
                    {formatHistoryMeta(entry)} ·{' '}
                    {new Date(entry.createdAt).toLocaleString('zh-CN')}
                  </Text>
                  {entry.errorText ? (
                    <Text
                      color={
                        entry.status === 'failed' ? 'errorText' : 'tertiary'
                      }
                      size="xs"
                    >
                      {entry.errorText}
                    </Text>
                  ) : null}
                </Column>
                {entry.uri ? (
                  <Button
                    onPress={() => handleShare(entry)}
                    size="small"
                    type="text"
                  >
                    分享
                  </Button>
                ) : null}
              </Row>
            ))}
          </Column>
        )}
      </Card>

      <Card titleText="账本快照" variant="elevated">
        <Column gap="small">
          <Text color="secondary" size="sm">
            完整导出本地账本的账本信息、资产、分类、标签、快捷模板和流水；图片可选，AI
            会话默认关闭。导入时只新建账本，不覆盖现有数据。
          </Text>
          <Column style={styles.actions}>
            <Button
              block
              onPress={() => navigation.navigate(ROOT_ROUTES.BackupExport)}
              type="primary"
            >
              导出账本
            </Button>
            <Button
              block
              onPress={() => navigation.navigate(ROOT_ROUTES.BackupImport)}
              type="dashed"
            >
              导入备份
            </Button>
          </Column>
        </Column>
      </Card>

      <Card titleText="配置与设置">
        <Column style={styles.actions}>
          <Button
            block
            onPress={() => navigation.navigate(ROOT_ROUTES.BackupAiConfig)}
            type="default"
          >
            AI 配置包（不含 API Key）
          </Button>
          <Button
            block
            onPress={() => navigation.navigate(ROOT_ROUTES.BackupSettings)}
            type="default"
          >
            设置包（快捷记账与主题）
          </Button>
          <Button
            block
            onPress={() => navigation.navigate(ROOT_ROUTES.BackupLanSend)}
            type="default"
          >
            局域网发送
          </Button>
          <Button
            block
            onPress={() => navigation.navigate(ROOT_ROUTES.BackupLanReceive)}
            type="default"
          >
            局域网接收
          </Button>
        </Column>
      </Card>

      <Card titleText="边界说明">
        <Column style={styles.note}>
          <Text size="sm" color="secondary">
            包含：账本信息、资产、分类、标签、快捷模板、流水、可选图片、可选 AI
            会话。
          </Text>
          <Text size="sm" color="secondary">
            AI 配置包：提供商定义与模型选择，不含 API Key。
          </Text>
          <Text size="sm" color="secondary">
            设置包：快捷记账设置与主题，不含网络账本和服务器连接。
          </Text>
          <Text size="sm" color="tertiary">
            网络账本不在一期导出范围内。
          </Text>
        </Column>
      </Card>
    </ScrollView>
  );
}
