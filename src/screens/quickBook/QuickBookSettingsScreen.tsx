import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BOOK_TYPE } from '@pennyspring/api';
import {
  ActionSheet,
  Button,
  Card,
  Column,
  Input,
  KeyboardAwareFormScroll,
  KeyboardAwareScreen,
  Row,
  Switch,
  Text,
  Textarea,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

import { getProviderDisplayName } from '../../agent/providers/display';
import type { AgentProviderConfig } from '../../agent/providers/types';
import {
  EMPTY_AGENT_SELECTION,
  useQuickBookSelection,
  useProviders,
} from '../../agent/providers/useProviders';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
import {
  DEFAULT_QUICK_BOOK_PROMPT,
  MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
  MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
} from '../../features/quickBook/constants';
import {
  hasScreenshotPermission,
  isScreenshotDetectionSupported,
  requestScreenshotPermission,
} from '../../features/quickBook/permission';
import {
  clampFreshWindowSeconds,
  useQuickBookSettingsStore,
} from '../../features/quickBook/settingsStore';
import {
  getDefaultQuickBookModel,
  resolveQuickBookModel,
} from '../../features/quickBook/validation';
import { getDraftErrorMessage } from '../../features/quickBookDraft/errorMessage';
import {
  getFloatingBallEnableBlockReason,
  getFloatingBallStatus,
  isFloatingBallSupported,
  openAccessibilitySettings,
  openNotificationSettings,
  openOverlaySettings,
  requestNotificationPermission,
  startFloatingBall,
  stopFloatingBall,
  syncFloatingBallEnabledSetting,
} from '../../features/quickBookDraft/floatingBall';
import type { QuickBookDraftNativeStatus } from '../../features/quickBookDraft/native';
import { ROOT_ROUTES, useNavigation } from '../../navigation';

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    gap: token.marginMD,
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
  section: {
    gap: token.marginSM,
  },
  hint: {
    paddingTop: token.paddingXXS,
  },
  truncate: {
    flexShrink: 1,
  },
}));

function getMultimodalModels(
  provider: AgentProviderConfig | null,
): AgentProviderConfig['models'] {
  if (provider === null) {
    return [];
  }
  return provider.models.filter(model => model.multimodal);
}

export function QuickBookSettingsScreen(): React.ReactElement {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();

  const settings = useQuickBookSettingsStore();
  const api = useGlobalApi();
  const bumpProviderVersion = useSyncVersionStore(
    state => state.bumpProviderVersion,
  );
  const { data: providers = [] } = useProviders();
  const { data: selection = EMPTY_AGENT_SELECTION } = useQuickBookSelection();

  const [providerSheetOpen, setProviderSheetOpen] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [resetPromptArmed, setResetPromptArmed] = useState(false);
  const [promptDraft, setPromptDraft] = useState(settings.presetPrompt);
  const savedPromptRef = useRef(settings.presetPrompt);
  const [windowText, setWindowText] = useState(
    String(settings.freshWindowSeconds),
  );

  useEffect(() => {
    const previousSavedPrompt = savedPromptRef.current;
    savedPromptRef.current = settings.presetPrompt;
    setPromptDraft(current =>
      current === previousSavedPrompt ? settings.presetPrompt : current,
    );
  }, [settings.presetPrompt]);

  const selectedProvider = useMemo(
    () =>
      providers.find(provider => provider.id === selection.providerId) ?? null,
    [providers, selection.providerId],
  );
  const multimodalModels = useMemo(
    () => getMultimodalModels(selectedProvider),
    [selectedProvider],
  );
  const resolution = useMemo(
    () => resolveQuickBookModel(providers, selection),
    [providers, selection],
  );
  const isConfigured = resolution.ok;
  const isAndroid = isScreenshotDetectionSupported();
  const book = useBookStore(state => state.currentBook);
  const floatingBallSupported = isFloatingBallSupported();
  const isLocalBook = book !== null && book.kind === BOOK_TYPE.local;
  const floatingBallBlockReason = getFloatingBallEnableBlockReason({
    isSupported: floatingBallSupported,
    isConfigured,
    isLocalBook,
  });
  const [floatingBallStatus, setFloatingBallStatus] =
    useState<QuickBookDraftNativeStatus | null>(null);
  const [floatingBallBusy, setFloatingBallBusy] = useState(false);
  const floatingBallBusyRef = useRef(false);
  const floatingBallAutoStoppedRef = useRef(false);

  const providerActions = useMemo(
    () =>
      providers.map(provider => ({
        text: getProviderDisplayName(provider),
        description: provider.baseUrl,
      })),
    [providers],
  );

  const modelActions = useMemo(
    () =>
      multimodalModels.map(model => ({
        text: model.modelId,
        description: `上下文 ${model.contextWindow}`,
      })),
    [multimodalModels],
  );

  const handleProviderAction = useCallback(
    (_action: unknown, index: number): void => {
      const provider = providers[index];
      if (!provider) {
        return;
      }
      const defaultModel = getDefaultQuickBookModel(provider);
      api.quickBook
        .setSelection({
          providerId: provider.id,
          modelId: defaultModel?.modelId ?? '',
        })
        .then(() => bumpProviderVersion())
        .catch(error => {
          toast.show({
            messageText:
              error instanceof Error ? error.message : '保存模型选择失败',
            status: 'error',
          });
        });
      if (defaultModel === null) {
        toast.show({
          messageText:
            '该提供商没有支持图片的模型，请先在提供商设置中开启多模态。',
          status: 'error',
        });
      }
    },
    [api, bumpProviderVersion, providers, toast],
  );

  const handleModelAction = useCallback(
    (_action: unknown, index: number): void => {
      const model = multimodalModels[index];
      if (!model || selectedProvider === null) {
        return;
      }
      api.quickBook
        .setSelection({
          providerId: selectedProvider.id,
          modelId: model.modelId,
        })
        .then(() => bumpProviderVersion())
        .catch(error => {
          toast.show({
            messageText:
              error instanceof Error ? error.message : '保存模型选择失败',
            status: 'error',
          });
        });
    },
    [api, bumpProviderVersion, multimodalModels, selectedProvider, toast],
  );

  const handleNudgeChange = useCallback(
    async (next: boolean): Promise<void> => {
      if (!next) {
        settings.setNudgeEnabled(false);
        return;
      }
      if (!isConfigured) {
        toast.show({
          messageText: '请先配置支持图片的 AI 模型。',
          status: 'error',
        });
        settings.setNudgeEnabled(false);
        return;
      }
      const granted =
        (await hasScreenshotPermission()) ||
        (await requestScreenshotPermission());
      if (!granted) {
        toast.show({
          messageText: '需要相册读取权限才能检测截图，请在系统设置中允许。',
          status: 'error',
        });
        settings.setNudgeEnabled(false);
        return;
      }
      settings.setNudgeEnabled(true);
    },
    [isConfigured, settings, toast],
  );

  const refreshFloatingBallStatus = useCallback(async (): Promise<void> => {
    if (!floatingBallSupported) {
      return;
    }
    try {
      const status = await getFloatingBallStatus();
      setFloatingBallStatus(status);
      const store = useQuickBookSettingsStore.getState();
      const permissionMissing =
        !status.overlayPermission ||
        !status.notificationPermission ||
        !status.accessibilityPermission;
      if (
        store.floatingBallEnabled &&
        !floatingBallBusyRef.current &&
        (permissionMissing || !status.floatingBallRunning)
      ) {
        if (status.floatingBallRunning) {
          try {
            await stopFloatingBall();
          } catch {
            // 权限失效时尽力停掉旧服务，失败不阻塞开关回写。
          }
        }
        store.setFloatingBallEnabled(false);
        try {
          syncFloatingBallEnabledSetting(false);
        } catch {
          // JS 侧已经关闭开关，原生标记失败不阻塞页面状态回写。
        }
        if (!floatingBallAutoStoppedRef.current) {
          floatingBallAutoStoppedRef.current = true;
          const autoStoppedMessage = !status.accessibilityPermission
            ? '无障碍截图服务已关闭，悬浮球已关闭，请重新启用后开启。'
            : !status.overlayPermission || !status.notificationPermission
              ? '悬浮窗或通知权限已失效，悬浮球已关闭，请重新授权后开启。'
              : '悬浮球已停止运行（服务被系统关闭），开关已自动关闭。';
          toast.show({
            messageText: autoStoppedMessage,
            status: 'error',
          });
        }
      }
    } catch (error) {
      setFloatingBallStatus(null);
      console.error('Floating ball status refresh failed:', error);
    }
  }, [floatingBallSupported, toast]);

  useFocusEffect(
    useCallback(() => {
      if (!floatingBallSupported) {
        return undefined;
      }
      refreshFloatingBallStatus().catch(() => undefined);
      const subscription = AppState.addEventListener('change', state => {
        if (state === 'active') {
          refreshFloatingBallStatus().catch(() => undefined);
        }
      });
      return () => {
        subscription.remove();
      };
    }, [floatingBallSupported, refreshFloatingBallStatus]),
  );

  const handleOpenOverlaySettings = useCallback((): void => {
    try {
      openOverlaySettings();
    } catch (error) {
      toast.show({
        messageText: getDraftErrorMessage(error, '打开悬浮窗设置失败'),
        status: 'error',
      });
    }
  }, [toast]);

  const handleOpenNotificationSettings = useCallback((): void => {
    try {
      openNotificationSettings();
    } catch (error) {
      toast.show({
        messageText: getDraftErrorMessage(error, '打开通知设置失败'),
        status: 'error',
      });
    }
  }, [toast]);

  const handleOpenAccessibilitySettings = useCallback((): void => {
    try {
      openAccessibilitySettings();
    } catch (error) {
      toast.show({
        messageText: getDraftErrorMessage(error, '打开无障碍设置失败'),
        status: 'error',
      });
    }
  }, [toast]);

  const setFloatingBallBusyState = useCallback((busy: boolean): void => {
    floatingBallBusyRef.current = busy;
    setFloatingBallBusy(busy);
  }, []);

  const handleFloatingBallToggle = useCallback(
    async (next: boolean): Promise<void> => {
      if (!floatingBallSupported || floatingBallBusyRef.current) {
        return;
      }
      if (!next) {
        setFloatingBallBusyState(true);
        try {
          await stopFloatingBall();
        } catch (error) {
          toast.show({
            messageText: getDraftErrorMessage(error, '关闭悬浮球失败'),
            status: 'error',
          });
        }
        settings.setFloatingBallEnabled(false);
        try {
          syncFloatingBallEnabledSetting(false);
        } catch {
          // 开关已按用户意图关闭，原生标记失败不回滚。
        }
        floatingBallAutoStoppedRef.current = false;
        setFloatingBallBusyState(false);
        await refreshFloatingBallStatus();
        return;
      }

      if (floatingBallBlockReason !== null) {
        toast.show({
          messageText: floatingBallBlockReason,
          status: 'error',
        });
        return;
      }

      setFloatingBallBusyState(true);
      try {
        const status = await getFloatingBallStatus();
        setFloatingBallStatus(status);
        if (!status.supported) {
          toast.show({
            messageText: '当前设备不支持悬浮球截图记账。',
            status: 'error',
          });
          return;
        }
        if (!status.overlayPermission) {
          openOverlaySettings();
          toast.show({
            messageText: '请先授权悬浮窗权限，授权后返回再次开启。',
            status: 'error',
          });
          return;
        }
        if (!status.accessibilityPermission) {
          openAccessibilitySettings();
          toast.show({
            messageText:
              '请先启用 PennySpring 截图服务（无障碍），启用后返回再次开启。',
            status: 'error',
          });
          return;
        }
        const notificationGranted =
          status.notificationPermission ||
          (await requestNotificationPermission());
        if (!notificationGranted) {
          toast.show({
            messageText: '需要通知权限才能接收草稿提醒，请在系统设置中允许。',
            status: 'error',
          });
          return;
        }
        const started = await startFloatingBall();
        if (!started) {
          toast.show({
            messageText: '悬浮球启动失败，请稍后重试。',
            status: 'error',
          });
          return;
        }
        settings.setFloatingBallEnabled(true);
        try {
          syncFloatingBallEnabledSetting(true);
        } catch {
          // 服务已启动，原生标记失败不影响 JS 开关。
        }
        floatingBallAutoStoppedRef.current = false;
        setFloatingBallStatus(await getFloatingBallStatus());
      } catch (error) {
        toast.show({
          messageText: getDraftErrorMessage(error, '开启悬浮球失败'),
          status: 'error',
        });
      } finally {
        setFloatingBallBusyState(false);
      }
    },
    [
      floatingBallBlockReason,
      floatingBallSupported,
      refreshFloatingBallStatus,
      setFloatingBallBusyState,
      settings,
      toast,
    ],
  );

  const handleClearProviderModel = useCallback((): void => {
    settings.setNudgeEnabled(false);
    api.quickBook
      .setSelection(EMPTY_AGENT_SELECTION)
      .then(() => bumpProviderVersion())
      .catch(error => {
        toast.show({
          messageText:
            error instanceof Error ? error.message : '清空模型选择失败',
          status: 'error',
        });
      });
    toast.show({ messageText: '已清空 AI 模型，截图提醒已关闭。' });
  }, [api, bumpProviderVersion, settings, toast]);

  const commitWindowText = useCallback((): void => {
    const parsed = Number(windowText);
    const clamped = clampFreshWindowSeconds(parsed);
    settings.setFreshWindowSeconds(clamped);
    setWindowText(String(clamped));
  }, [settings, windowText]);

  const handleResetPrompt = useCallback((): void => {
    if (!resetPromptArmed) {
      setResetPromptArmed(true);
      return;
    }
    setPromptDraft(DEFAULT_QUICK_BOOK_PROMPT);
    setResetPromptArmed(false);
  }, [resetPromptArmed]);

  const handleSavePrompt = useCallback((): void => {
    settings.setPresetPrompt(promptDraft);
    savedPromptRef.current = promptDraft;
    setResetPromptArmed(false);
    toast.show({ messageText: '提示词已保存，下次截图触发时生效' });
  }, [promptDraft, settings, toast]);

  const handleOpenProviderSettings = useCallback((): void => {
    navigation.navigate(ROOT_ROUTES.AgentSettings);
  }, [navigation]);

  return (
    <KeyboardAwareScreen style={styles.container}>
      <KeyboardAwareFormScroll
        scrollEnabled
        styles={{ content: styles.content }}
      >
        <Card titleText="截图提醒" variant="plain">
          <Column style={styles.section}>
            <Row align="center" gap="normal" justify="between">
              <Column gap="small" style={styles.truncate}>
                <Text size="sm">回到 App 时发现新截图</Text>
                <Text color="secondary" size="xs">
                  {isAndroid
                    ? '需要相册读取权限；点击提示后由助手记账。'
                    : 'iOS 暂不支持：系统不提供后台截屏感知。'}
                </Text>
              </Column>
              <Switch
                disabled={!isAndroid}
                onChange={value => {
                  handleNudgeChange(value).catch(() => undefined);
                }}
                value={settings.nudgeEnabled && isConfigured}
              />
            </Row>
            {isAndroid && !isConfigured ? (
              <Text color="warningText" size="xs" style={styles.hint}>
                请先配置支持图片的 AI 模型，才能开启截图提醒。
              </Text>
            ) : null}
            <Input
              keyboardType="number-pad"
              labelText="最近判断时间"
              onBlur={commitWindowText}
              onChange={setWindowText}
              suffix={
                <Text color="secondary" size="sm">
                  秒
                </Text>
              }
              value={windowText}
            />
            <Text color="tertiary" size="xs" style={styles.hint}>
              最新一张截图的创建时间距今不超过该值（
              {MIN_SCREENSHOT_FRESH_WINDOW_SECONDS}–
              {MAX_SCREENSHOT_FRESH_WINDOW_SECONDS} 秒）才会提示。
            </Text>
            <Row align="center" gap="normal" justify="between">
              <Column gap="small" style={styles.truncate}>
                <Text size="sm">新增记录免确认</Text>
                <Text color="secondary" size="xs">
                  截图触发的记账会直接写入账本，不再弹出确认卡片；系统分享的图片会生成草稿，在草稿
                  Tab 确认。
                </Text>
              </Column>
              <Switch
                disabled={!isAndroid}
                onChange={settings.setAutoApproveScreenshot}
                value={isAndroid && settings.autoApproveScreenshot}
              />
            </Row>
          </Column>
        </Card>

        {isAndroid && floatingBallSupported ? (
          <Card titleText="悬浮球截图记账" variant="plain">
            <Column style={styles.section}>
              <Row align="center" gap="normal" justify="between">
                <Column gap="small" style={styles.truncate}>
                  <Text size="sm">启用悬浮球</Text>
                  <Text color="secondary" size="xs">
                    点按悬浮球圈选区域，草稿生成后回到首页确认入账。
                  </Text>
                </Column>
                <Switch
                  disabled={
                    floatingBallBusy ||
                    (floatingBallBlockReason !== null &&
                      !settings.floatingBallEnabled)
                  }
                  onChange={value => {
                    handleFloatingBallToggle(value).catch(() => undefined);
                  }}
                  value={settings.floatingBallEnabled}
                />
              </Row>
              {floatingBallBlockReason !== null ? (
                <Text color="warningText" size="xs" style={styles.hint}>
                  {floatingBallBlockReason}
                </Text>
              ) : null}
              <Row align="center" justify="between">
                <Text size="sm">悬浮窗权限</Text>
                <Row align="center" gap="small">
                  <Text
                    color={
                      floatingBallStatus?.overlayPermission
                        ? 'successText'
                        : 'warningText'
                    }
                    size="xs"
                  >
                    {floatingBallStatus === null
                      ? '未检测'
                      : floatingBallStatus.overlayPermission
                        ? '已授权'
                        : '未授权'}
                  </Text>
                  <Button
                    onPress={handleOpenOverlaySettings}
                    size="small"
                    type="text"
                  >
                    去设置
                  </Button>
                </Row>
              </Row>
              <Row align="center" justify="between">
                <Text size="sm">无障碍截图服务</Text>
                <Row align="center" gap="small">
                  <Text
                    color={
                      floatingBallStatus?.accessibilityPermission
                        ? 'successText'
                        : 'warningText'
                    }
                    size="xs"
                  >
                    {floatingBallStatus === null
                      ? '未检测'
                      : floatingBallStatus.accessibilityPermission
                        ? '已启用'
                        : '未启用'}
                  </Text>
                  <Button
                    onPress={handleOpenAccessibilitySettings}
                    size="small"
                    type="text"
                  >
                    去设置
                  </Button>
                </Row>
              </Row>
              <Row align="center" justify="between">
                <Text size="sm">通知权限</Text>
                <Row align="center" gap="small">
                  <Text
                    color={
                      floatingBallStatus?.notificationPermission
                        ? 'successText'
                        : 'warningText'
                    }
                    size="xs"
                  >
                    {floatingBallStatus === null
                      ? '未检测'
                      : floatingBallStatus.notificationPermission
                        ? '已授权'
                        : '未授权'}
                  </Text>
                  <Button
                    onPress={handleOpenNotificationSettings}
                    size="small"
                    type="text"
                  >
                    去设置
                  </Button>
                </Row>
              </Row>
              <Text color="tertiary" size="xs" style={styles.hint}>
                自由截图通过无障碍服务完成，启用后无需每次授权；请先在系统设置中开启
                PennySpring 截图服务。
              </Text>
            </Column>
          </Card>
        ) : null}

        <Card
          extra={
            selectedProvider !== null || selection.modelId !== '' ? (
              <Button
                onPress={handleClearProviderModel}
                size="small"
                type="text"
              >
                清空
              </Button>
            ) : null
          }
          titleText="AI 模型"
          variant="plain"
        >
          <Column style={styles.section}>
            <Row align="center" justify="between">
              <Text size="sm">提供商</Text>
              <Button
                disabled={providers.length === 0}
                onPress={() => setProviderSheetOpen(true)}
                size="small"
                type="text"
              >
                {selectedProvider
                  ? getProviderDisplayName(selectedProvider)
                  : '未选择'}
              </Button>
            </Row>
            <Row align="center" justify="between">
              <Text size="sm">模型</Text>
              <Button
                disabled={selectedProvider === null}
                onPress={() => setModelSheetOpen(true)}
                size="small"
                type="text"
              >
                {selection.modelId || '未选择'}
              </Button>
            </Row>
            {providers.length === 0 ? (
              <Column gap="small">
                <Text color="secondary" size="xs">
                  还没有 AI 提供商，先添加一个并配置支持图片的模型。
                </Text>
                <Button
                  onPress={handleOpenProviderSettings}
                  size="small"
                  type="default"
                >
                  去添加提供商
                </Button>
              </Column>
            ) : null}
            {isConfigured ? (
              <Text color="tertiary" size="xs">
                该会话只使用所选提供商与模型，不影响普通对话。
              </Text>
            ) : (
              <Text color="errorText" size="xs">
                请选择支持图片输入的提供商与模型。
              </Text>
            )}
          </Column>
        </Card>

        <Card
          extra={
            <Button
              disabled={promptDraft === DEFAULT_QUICK_BOOK_PROMPT}
              onPress={handleResetPrompt}
              size="small"
              type={resetPromptArmed ? 'danger' : 'text'}
            >
              {resetPromptArmed ? '确认恢复' : '恢复默认'}
            </Button>
          }
          footer={
            <Button
              block
              disabled={promptDraft === settings.presetPrompt}
              onPress={handleSavePrompt}
              testID="quick-book-save-prompt"
              type="primary"
            >
              保存提示词
            </Button>
          }
          titleText="预设提示词"
          variant="plain"
        >
          <Column style={styles.section}>
            <Textarea
              maxRows={8}
              minRows={4}
              onChange={value => {
                setResetPromptArmed(false);
                setPromptDraft(value);
              }}
              placeholder={DEFAULT_QUICK_BOOK_PROMPT}
              showCount
              value={promptDraft}
            />
            <Text color="tertiary" size="xs">
              发送截图时，这段文字会作为用户消息的第一段内容。
            </Text>
          </Column>
        </Card>
      </KeyboardAwareFormScroll>

      <ActionSheet
        actions={providerActions}
        onAction={handleProviderAction}
        onOpenChange={setProviderSheetOpen}
        open={providerSheetOpen}
        titleText="选择 AI 提供商"
      />
      <ActionSheet
        actions={modelActions}
        onAction={handleModelAction}
        onOpenChange={setModelSheetOpen}
        open={modelSheetOpen}
        titleText="选择支持图片的模型"
      />
    </KeyboardAwareScreen>
  );
}
