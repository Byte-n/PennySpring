import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  ActionSheet,
  Button,
  Card,
  Column,
  Input,
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
import { useGlobalApi } from '../../stores/bookStore';
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
  const [windowText, setWindowText] = useState(
    String(settings.freshWindowSeconds),
  );

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
    settings.setPresetPrompt(DEFAULT_QUICK_BOOK_PROMPT);
    setResetPromptArmed(false);
    toast.show({ messageText: '已恢复默认提示词' });
  }, [resetPromptArmed, settings, toast]);

  const handleOpenProviderSettings = useCallback((): void => {
    navigation.navigate(ROOT_ROUTES.AgentSettings);
  }, [navigation]);

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled>
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
                  截图触发的记账会直接写入账本，不再弹出确认卡片；分享图片进入的记账仍会先确认。
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
            settings.presetPrompt !== DEFAULT_QUICK_BOOK_PROMPT ? (
              <Button
                onPress={handleResetPrompt}
                size="small"
                type={resetPromptArmed ? 'danger' : 'text'}
              >
                {resetPromptArmed ? '确认恢复' : '恢复默认'}
              </Button>
            ) : null
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
                settings.setPresetPrompt(value);
              }}
              placeholder={DEFAULT_QUICK_BOOK_PROMPT}
              showCount
              value={settings.presetPrompt}
            />
            <Text color="tertiary" size="xs">
              发送截图时，这段文字会作为用户消息的第一段内容。
            </Text>
          </Column>
        </Card>
      </ScrollView>

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
    </Column>
  );
}
