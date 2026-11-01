import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  Button,
  Card,
  Column,
  Progress,
  Popup,
  Row,
  Switch,
  Tag,
  Text,
  createUseSheetStyle,
  useTheme,
  useToast,
} from '@pennyspring/ui';
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
  PlayIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';

import {
  checkForUpdate,
  downloadUpdate,
  getExistingDownload,
  getInstalledVersion,
  installUpdate,
  type DownloadProgress,
  type InstalledVersion,
} from '../../features/appUpdate/client';
import {
  rehydrateAutoUpdate,
  useAutoUpdateStore,
} from '../../features/appUpdate/autoUpdateStore';
import type { UpdateTarget } from '../../features/appUpdate/update';

type UpdateState =
  | 'idle'
  | 'checking'
  | 'current'
  | 'available'
  | 'downloading'
  | 'interrupted'
  | 'ready'
  | 'installing'
  | 'error';

const BYTES_PER_KIB = 1024;
const BYTES_PER_MIB = BYTES_PER_KIB * BYTES_PER_KIB;
const FULL_PERCENT = 100;

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
  intro: {
    alignItems: 'center',
    gap: token.marginXXS,
    paddingVertical: token.paddingSM,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusLG,
    height: token.sizeXXL,
    justifyContent: 'center',
    width: token.sizeXXL,
  },
  logoText: {
    color: token.colorTextLightSolid,
    fontSize: token.fontSizeHeading3,
    fontWeight: '700',
  },
  cardContent: {
    gap: token.marginSM,
  },
  row: {
    alignItems: 'center',
    gap: token.marginSM,
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
    gap: token.marginXXS,
  },
  actions: {
    gap: token.marginXS,
  },
  progress: {
    gap: token.marginXXS,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notes: {
    gap: token.marginXXS,
  },
  releaseNotesContent: {
    gap: token.marginSM,
  },
  error: {
    backgroundColor: token.colorErrorBg,
    borderRadius: token.borderRadiusSM,
    padding: token.paddingSM,
  },
  warning: {
    backgroundColor: token.colorWarningBg,
    borderRadius: token.borderRadiusSM,
    padding: token.paddingSM,
  },
  footer: {
    alignItems: 'center',
    gap: token.marginXXS,
    paddingVertical: token.paddingSM,
  },
}));

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '更新操作失败';
}

function formatBytes(value: number): string {
  if (value < BYTES_PER_MIB) {
    return `${Math.max(1, Math.round(value / BYTES_PER_KIB))} KB`;
  }
  return `${(value / BYTES_PER_MIB).toFixed(1)} MB`;
}

export function AboutScreen() {
  const styles = useStyles();
  const { token } = useTheme();
  const toast = useToast();
  const autoCheckEnabled = useAutoUpdateStore(state => state.autoCheckEnabled);
  const setAutoCheckEnabled = useAutoUpdateStore(
    state => state.setAutoCheckEnabled,
  );
  const [installed, setInstalled] = useState<InstalledVersion | null>(null);
  const [target, setTarget] = useState<UpdateTarget | null>(null);
  const [state, setState] = useState<UpdateState>('idle');
  const [errorText, setErrorText] = useState('');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloadPath, setDownloadPath] = useState('');
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);

  useEffect(() => {
    rehydrateAutoUpdate().catch(() => undefined);
  }, []);

  useEffect(() => {
    getInstalledVersion()
      .then(version => setInstalled(version))
      .catch(error => {
        setState('error');
        setErrorText(getErrorMessage(error));
      });
  }, []);

  const handleCheck = useCallback(async (): Promise<void> => {
    if (!installed || state === 'checking' || state === 'downloading') return;
    setState('checking');
    setErrorText('');
    try {
      const result = await checkForUpdate(installed);
      if (result.status === 'current') {
        setTarget(null);
        setDownloadPath('');
        setProgress(null);
        setState('current');
        toast.show({ messageText: '当前已是最新版本', status: 'success' });
        return;
      }
      setTarget(result);
      const existingDownload = await getExistingDownload(
        result.apk,
        result.release.versionName,
      );
      if (existingDownload.status === 'complete') {
        setDownloadPath(existingDownload.path);
        setProgress({
          bytesRead: existingDownload.sizeBytes,
          totalBytes: result.apk.size,
          resumed: true,
        });
        setState('ready');
        return;
      }
      setDownloadPath('');
      setProgress(
        existingDownload.status === 'partial'
          ? {
              bytesRead: existingDownload.sizeBytes,
              totalBytes: result.apk.size,
              resumed: true,
            }
          : null,
      );
      setState(
        existingDownload.status === 'partial' ? 'interrupted' : 'available',
      );
    } catch (error: unknown) {
      setState('error');
      setErrorText(getErrorMessage(error));
    }
  }, [installed, state, toast]);

  const handleDownload = useCallback(async (): Promise<void> => {
    if (!target || state === 'downloading') return;
    setState('downloading');
    setErrorText('');
    try {
      const result = await downloadUpdate(
        target.apk,
        target.release.versionName,
        setProgress,
      );
      setDownloadPath(result.path);
      setState('ready');
      toast.show({ messageText: '下载完成，文件校验通过', status: 'success' });
    } catch (error: unknown) {
      setState('interrupted');
      setErrorText(getErrorMessage(error));
    }
  }, [target, state, toast]);

  const handleInstall = useCallback(async (): Promise<void> => {
    if (!downloadPath || state === 'installing') return;
    setState('installing');
    try {
      await installUpdate(downloadPath);
    } catch (error: unknown) {
      setState('ready');
      setErrorText(getErrorMessage(error));
    }
  }, [downloadPath, state]);

  const progressPercent =
    progress && progress.totalBytes > 0
      ? Math.min(
          FULL_PERCENT,
          (progress.bytesRead / progress.totalBytes) * FULL_PERCENT,
        )
      : 0;
  const releaseNotes = target?.releaseNotes ?? [];
  const hasReleaseNotes = releaseNotes.some(release => release.notes.trim());
  const isBusy =
    state === 'checking' || state === 'downloading' || state === 'installing';

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Column style={styles.intro}>
        <Column style={styles.logo}>
          <Text style={styles.logoText}>P</Text>
        </Column>
        <Text size="h4" weight="strong">
          PennySpring
        </Text>
        <Text color="tertiary" size="sm">
          个人账本 · Android
        </Text>
      </Column>

      <Card titleText="当前版本" variant="elevated">
        <Column style={styles.cardContent}>
          <Row style={styles.row}>
            <Column style={styles.rowText}>
              <Text color="secondary" size="sm">
                版本号
              </Text>
              <Text size="lg" weight="semibold">
                {installed ? `v${installed.versionName}` : '读取中…'}
              </Text>
            </Column>
            {installed ? <Tag color="success">正式版</Tag> : null}
          </Row>
          <Text color="tertiary" size="xs">
            {installed
              ? `版本编码 ${installed.versionCode} · 直接安装`
              : '正在读取安装包版本信息'}
          </Text>
        </Column>
      </Card>

      <Card
        extra={
          state === 'current' ? (
            <Tag color="success" size="small">
              已是最新
            </Tag>
          ) : null
        }
        titleText="应用更新"
        variant="elevated"
      >
        <Column style={styles.cardContent}>
          {state === 'available' ||
          state === 'interrupted' ||
          state === 'downloading' ||
          state === 'ready' ||
          state === 'installing' ? (
            <Column style={styles.cardContent}>
              <Row style={styles.row}>
                <Column style={styles.rowText}>
                  <Text size="lg" weight="semibold">
                    发现新版本 v{target?.release.versionName}
                  </Text>
                  <Text color="secondary" size="sm">
                    {target ? formatBytes(target.apk.size) : ''}
                  </Text>
                </Column>
                <Button
                  onPress={() => setReleaseNotesOpen(true)}
                  type="link"
                >
                  更新说明
                </Button>
              </Row>
              {progress &&
              (state === 'downloading' || state === 'interrupted') ? (
                <Column style={styles.progress}>
                  <Progress.Bar percent={progressPercent} showInfo={false} />
                  <Row style={styles.progressInfo}>
                    <Text color="secondary" size="xs">
                      {formatBytes(progress.bytesRead)} /{' '}
                      {formatBytes(progress.totalBytes)}
                    </Text>
                    <Text color="secondary" size="xs">
                      {Math.round(progressPercent)}%
                    </Text>
                  </Row>
                </Column>
              ) : null}
              {state === 'interrupted' ? (
                <Row style={styles.warning}>
                  <WarningCircleIcon color={token.colorWarning} size={18} />
                  <Text color="secondary" size="sm" style={styles.rowText}>
                    {errorText ||
                      '下载已中断，已保留本地文件，继续下载会从已完成位置开始。'}
                  </Text>
                </Row>
              ) : null}
              <Row style={styles.actions}>
                {state === 'ready' ? (
                  <Button
                    block
                    icon={PlayIcon}
                    onPress={handleInstall}
                    type="primary"
                  >
                    安装更新
                  </Button>
                ) : (
                  <Button
                    block
                    disabled={state === 'installing'}
                    icon={DownloadSimpleIcon}
                    loading={state === 'downloading' || state === 'installing'}
                    onPress={handleDownload}
                    type="primary"
                  >
                    {state === 'installing'
                      ? '正在打开安装器…'
                      : state === 'interrupted'
                      ? '继续下载'
                      : '下载更新'}
                  </Button>
                )}
              </Row>
              {errorText && state === 'ready' ? (
                <Text color="errorText" size="sm">
                  {errorText}
                </Text>
              ) : null}
            </Column>
          ) : null}
          {state === 'error' ? (
            <Row style={styles.error}>
              <WarningCircleIcon color={token.colorError} size={18} />
              <Text color="errorText" size="sm" style={styles.rowText}>
                {errorText}
              </Text>
            </Row>
          ) : null}
          {state === 'current' ? (
            <Row style={styles.row}>
              <Row style={styles.rowText}>
                <CheckCircleIcon color={token.colorSuccess} size={18} />
                <Text color="secondary" size="sm">
                  当前已是最新版本
                </Text>
              </Row>
              <Text color="tertiary" size="xs">
                刚刚检查
              </Text>
            </Row>
          ) : null}
          {state === 'idle' || state === 'checking' ? (
            <Text color="secondary" size="sm">
              手动检查 GitHub Release 中的最新稳定版本。
            </Text>
          ) : null}
          <Row style={styles.row}>
            <Column style={styles.rowText}>
              <Text size="sm">自动检查更新</Text>
              <Text color="tertiary" size="xs">
                每次启动应用时检查新版本，发现后弹窗提示
              </Text>
            </Column>
            <Switch
              accessibilityLabel="自动检查更新"
              onChange={setAutoCheckEnabled}
              value={autoCheckEnabled}
            />
          </Row>
          <Button
            disabled={isBusy || !installed}
            icon={ArrowClockwiseIcon}
            loading={state === 'checking'}
            onPress={handleCheck}
            type="default"
          >
            再次检查更新
          </Button>
        </Column>
      </Card>

      <Column style={styles.footer}>
        <Text color="tertiary" size="xs">
          更新来源：Byte-n/PennySpring GitHub Release
        </Text>
        <Text color="tertiary" size="xs">
          下载完成后会交由 Android 系统确认安装
        </Text>
      </Column>
      <Popup.FloatingPanel
        bodyScrollable
        height="75%"
        onOpenChange={setReleaseNotesOpen}
        open={releaseNotesOpen}
        scrollEnabled
        titleText="版本更新说明"
      >
        {hasReleaseNotes ? (
          <Column style={styles.releaseNotesContent}>
            {releaseNotes.map(release => {
              if (!release.notes.trim()) return null;
              return (
                <Column key={release.versionCode} style={styles.notes}>
                  <Text color="secondary" size="sm" weight="semibold">
                    v{release.versionName}
                  </Text>
                  <Text color="secondary" size="sm">
                    {release.notes}
                  </Text>
                </Column>
              );
            })}
          </Column>
        ) : (
          <Text color="tertiary" size="sm">
            暂无更新说明
          </Text>
        )}
      </Popup.FloatingPanel>
    </ScrollView>
  );
}
