import React, { useCallback, useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import {
  Button,
  Column,
  Icon,
  Input,
  Popup,
  Row,
  Switch,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

import {
  clearProviderApiKey,
  loadProviderApiKey,
  saveProviderApiKey,
} from '../../agent/providers/secureKey';
import {
  fetchProviderModels,
  testProviderConnection,
} from '../../agent/providers/connectionTest';
import {
  requireProviderDescriptor,
} from '../../agent/providers/catalog';
import {
  useAgentProviderStore,
} from '../../agent/providers/configStore';
import type {
  AgentProviderConfig,
  AgentProviderDraft,
} from '../../agent/providers/types';
import { isValidBaseUrl, normalizeBaseUrl } from '../../agent/core/url';

const MODEL_PREVIEW_LIMIT = 12;

interface ConnectionResult {
  ok: boolean;
  message: string;
}

export interface AgentProviderEditorProps {
  open: boolean;
  initial: AgentProviderConfig | null;
  descriptorId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: (provider: AgentProviderConfig) => void;
}

const useStyles = createUseSheetStyle(token => ({
  body: {
    gap: token.marginMD,
    paddingBottom: token.padding,
  },
  actions: {
    alignItems: 'center',
    gap: token.marginSM,
  },
  result: {
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  success: {
    backgroundColor: token.colorSuccessBg,
  },
  error: {
    backgroundColor: token.colorErrorBg,
  },
  models: {
    gap: token.marginXS,
  },
  modelsHeader: {
    gap: token.marginXXS,
  },
  modelButton: {
    alignSelf: 'flex-start',
  },
  advanced: {
    gap: token.marginXS,
  },
  advancedToggle: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: token.borderRadiusSM,
    flexDirection: 'row',
    gap: token.marginXXS,
    minHeight: token.controlHeight,
    paddingHorizontal: token.paddingXXS,
  },
  advancedTogglePressed: {
    backgroundColor: token.colorFillContent,
  },
  switchRow: {
    alignItems: 'center',
    gap: token.marginSM,
  },
  switchText: {
    flex: 1,
    gap: token.marginXXS,
  },
}));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '操作失败，请稍后再试。';
}

function buildDraft(
  descriptorId: string,
  name: string,
  baseUrl: string,
  model: string,
  storeResponses: boolean,
): Required<AgentProviderDraft> {
  return {
    descriptorId,
    name: name.trim(),
    baseUrl: normalizeBaseUrl(baseUrl),
    model: model.trim(),
    storeResponses,
  };
}

function createDraftConfig(
  descriptorId: string,
  draft: AgentProviderDraft,
  id: string,
): AgentProviderConfig {
  const now = Date.now();
  return {
    id,
    descriptorId: draft.descriptorId,
    name: draft.name,
    baseUrl: draft.baseUrl,
    model: draft.model,
    storeResponses: draft.storeResponses ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

export function AgentProviderEditor({
  open,
  initial,
  descriptorId,
  onOpenChange,
  onSaved,
}: AgentProviderEditorProps) {
  const styles = useStyles();
  const toast = useToast();
  const addProvider = useAgentProviderStore(state => state.addProvider);
  const updateProvider = useAgentProviderStore(state => state.updateProvider);

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [storeResponses, setStoreResponses] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [keyStored, setKeyStored] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionResult | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [saving, setSaving] = useState(false);

  const descriptor = requireProviderDescriptor(
    initial?.descriptorId ?? descriptorId,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    setName(initial?.name ?? '');
    setBaseUrl(initial?.baseUrl ?? descriptor.defaultBaseUrl);
    setModel(initial?.model ?? '');
    setStoreResponses(initial?.storeResponses ?? true);
    setApiKey('');
    setTestResult(null);
    setModels([]);
    setAdvancedOpen(false);
    setKeyStored(false);

    if (!initial) {
      return;
    }

    loadProviderApiKey(initial.id)
      .then(storedKey => {
        if (!cancelled) {
          setKeyStored(Boolean(storedKey));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setKeyStored(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [descriptor.defaultBaseUrl, initial, open]);

  const resolveApiKey = useCallback(async (): Promise<string> => {
    if (apiKey.trim()) {
      return apiKey.trim();
    }
    if (initial) {
      return (await loadProviderApiKey(initial.id)) ?? '';
    }
    return '';
  }, [apiKey, initial]);

  const buildPreviewConfig = useCallback(
    (draft: AgentProviderDraft): AgentProviderConfig =>
      createDraftConfig(descriptor.id, draft, initial?.id ?? 'draft'),
    [descriptor.id, initial?.id],
  );

  const handleTest = useCallback(async (): Promise<void> => {
    const draft = buildDraft(
      descriptor.id,
      name,
      baseUrl,
      model,
      storeResponses,
    );
    if (!isValidBaseUrl(draft.baseUrl)) {
      setTestResult({
        ok: false,
        message: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return;
    }
    if (!draft.model) {
      setTestResult({ ok: false, message: '请先填写模型名称。' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const key = await resolveApiKey();
      if (!key) {
        setTestResult({ ok: false, message: '请先填写 API Key。' });
        return;
      }
      const result = await testProviderConnection(
        buildPreviewConfig(draft),
        key,
      );
      setTestResult(result);
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    } finally {
      setTesting(false);
    }
  }, [
    baseUrl,
    buildPreviewConfig,
    descriptor.id,
    model,
    name,
    resolveApiKey,
    storeResponses,
  ]);

  const handleFetchModels = useCallback(async (): Promise<void> => {
    const draft = buildDraft(
      descriptor.id,
      name,
      baseUrl,
      model,
      storeResponses,
    );
    if (!isValidBaseUrl(draft.baseUrl)) {
      setTestResult({
        ok: false,
        message: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return;
    }

    setFetchingModels(true);
    setTestResult(null);
    try {
      const key = await resolveApiKey();
      if (!key) {
        setTestResult({ ok: false, message: '请先填写 API Key。' });
        return;
      }
      const list = await fetchProviderModels(buildPreviewConfig(draft), key);
      setModels(list.slice(0, MODEL_PREVIEW_LIMIT));
      if (list.length === 0) {
        setTestResult({
          ok: false,
          message: '端点没有返回模型列表，请手动填写模型名称。',
        });
      }
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    } finally {
      setFetchingModels(false);
    }
  }, [
    baseUrl,
    buildPreviewConfig,
    descriptor.id,
    model,
    name,
    resolveApiKey,
    storeResponses,
  ]);

  const handleClearKey = useCallback(async (): Promise<void> => {
    if (!initial) {
      setApiKey('');
      setKeyStored(false);
      return;
    }
    try {
      await clearProviderApiKey(initial.id);
      setKeyStored(false);
      setApiKey('');
      setTestResult({ ok: true, message: '已清除保存的 API Key。' });
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    }
  }, [initial]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const draft = buildDraft(
      descriptor.id,
      name,
      baseUrl,
      model,
      storeResponses,
    );
    if (!isValidBaseUrl(draft.baseUrl)) {
      toast.show({
        messageText: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return false;
    }
    if (!draft.model) {
      toast.show({ messageText: '请填写模型名称。' });
      return false;
    }
    if (!apiKey.trim() && !keyStored) {
      toast.show({ messageText: '请填写 API Key。' });
      return false;
    }

    setSaving(true);
    try {
      let saved: AgentProviderConfig;
      if (initial) {
        updateProvider(initial.id, draft);
        saved = { ...initial, ...draft, updatedAt: Date.now() };
      } else {
        saved = addProvider(draft);
      }

      if (apiKey.trim()) {
        await saveProviderApiKey(saved.id, apiKey);
        setKeyStored(true);
        setApiKey('');
      }

      onSaved(saved);
      toast.show({ messageText: 'AI 提供商已保存' });
      onOpenChange(false);
      return true;
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
      return false;
    } finally {
      setSaving(false);
    }
  }, [
    addProvider,
    apiKey,
    baseUrl,
    descriptor.id,
    initial,
    keyStored,
    model,
    name,
    onOpenChange,
    onSaved,
    storeResponses,
    toast,
    updateProvider,
  ]);

  return (
    <Popup.FloatingPanel
      cancelText="关闭"
      height="82%"
      keyboardAvoiding
      okDisabled={saving}
      okLoading={saving}
      okText="保存"
      onOk={handleSave}
      onOpenChange={onOpenChange}
      open={open}
      titleText={initial ? '编辑提供商' : '添加提供商'}
    >
      <Column style={styles.body}>
        <Text color="secondary" size="xs">
          {descriptor.description}
        </Text>

        <Input
          autoCapitalize="none"
          autoCorrect={false}
          labelText="名称"
          onChange={setName}
          placeholder={descriptor.name}
          value={name}
        />

        <Input
          autoCapitalize="none"
          autoCorrect={false}
          labelText="Base URL"
          onChange={setBaseUrl}
          placeholder={descriptor.baseUrlHint}
          value={baseUrl}
        />

        <Input
          autoCapitalize="none"
          autoCorrect={false}
          labelText={`API Key${keyStored ? '（已填）' : ''}`}
          onChange={setApiKey}
          placeholder={
            keyStored
              ? '已保存到系统钥匙串，留空则不修改'
              : 'sk-...，仅保存在系统钥匙串'
          }
          secureTextEntry
          value={apiKey}
        />

        <Input
          autoCapitalize="none"
          autoCorrect={false}
          labelText="模型名称"
          onChange={setModel}
          placeholder={descriptor.modelPlaceholder}
          value={model}
        />

        {descriptor.apiKind === 'responses' ? (
          <Column style={styles.advanced}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: advancedOpen }}
              onPress={() => setAdvancedOpen(previous => !previous)}
              style={({ pressed }) => [
                styles.advancedToggle,
                pressed ? styles.advancedTogglePressed : undefined,
              ]}
            >
              <Text color="secondary" size="md">
                其他
              </Text>
              <Icon
                color="tertiary"
                icon={advancedOpen ? 'caret-down' : 'caret-right'}
                size="small"
              />
            </Pressable>
            {advancedOpen ? (
              <Row style={styles.switchRow}>
                <Column style={styles.switchText}>
                  <Text size="md">服务端存储会话</Text>
                  <Text color="secondary" size="xs">
                    对应 Responses 的 store
                    参数。第三方中转网关无法引用上一轮结果时需关闭。
                  </Text>
                </Column>
                <Switch onChange={setStoreResponses} value={storeResponses} />
              </Row>
            ) : null}
          </Column>
        ) : null}

        <Row style={styles.actions}>
          <Button
            disabled={testing}
            loading={testing}
            onPress={handleTest}
            size="small"
            type="default"
          >
            测试连接
          </Button>
          <Button
            disabled={fetchingModels}
            loading={fetchingModels}
            onPress={handleFetchModels}
            size="small"
            type="default"
            variant="filled"
          >
            获取模型
          </Button>
          <Button
            disabled={!keyStored}
            onPress={handleClearKey}
            size="small"
            type="text"
          >
            清除 Key
          </Button>
        </Row>

        {models.length > 0 ? (
          <Column style={styles.models}>
            <Column style={styles.modelsHeader}>
              <Text color="secondary" size="xs">
                可用模型
              </Text>
              <Text color="tertiary" size="xs">
                点击模型会自动填入上方的「模型名称」。
              </Text>
            </Column>
            {models.map(item => (
              <Button
                key={item}
                onPress={() => setModel(item)}
                size="small"
                style={styles.modelButton}
                type="text"
              >
                {item}
              </Button>
            ))}
          </Column>
        ) : null}

        {testResult ? (
          <Column
            style={[
              styles.result,
              testResult.ok ? styles.success : styles.error,
            ]}
          >
            <Text color={testResult.ok ? 'successText' : 'errorText'} size="xs">
              {testResult.message}
            </Text>
          </Column>
        ) : null}
      </Column>
    </Popup.FloatingPanel>
  );
}
