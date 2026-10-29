import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import {
  Button,
  Column,
  Divider,
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
} from '../providers/secureKey';
import {
  fetchProviderModels,
  testProviderConnection,
} from '../providers/connectionTest';
import { requireProviderDescriptor } from '../providers/catalog';
import { useAgentProviderStore } from '../providers/configStore';
import type {
  AgentProviderConfig,
  AgentProviderDraft,
} from '../providers/types';
import { isValidBaseUrl, normalizeBaseUrl } from '../core/url';
import { InfoHint } from './InfoHint';
import {
  ProviderModelSection,
  createModelRow,
  toModelConfigs,
  toModelRow,
  type ModelRowState,
} from './ProviderModelSection';

const MODEL_PREVIEW_LIMIT = 20;

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
    flexWrap: 'wrap',
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
  advanced: {
    gap: token.marginXS,
  },
  sectionDivider: {
    marginVertical: 0,
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
  switchLabel: {
    alignItems: 'center',
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
  const [modelRows, setModelRows] = useState<ModelRowState[]>([]);
  const [defaultModelId, setDefaultModelId] = useState('');
  const [manualModel, setManualModel] = useState('');
  const [storeResponses, setStoreResponses] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [keyStored, setKeyStored] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionResult | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
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
    setModelRows(initial ? initial.models.map(toModelRow) : []);
    setDefaultModelId(initial?.defaultModelId ?? '');
    setManualModel('');
    setStoreResponses(initial?.storeResponses ?? true);
    setApiKey('');
    setTestResult(null);
    setAvailableModels([]);
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

  const previewProvider = useMemo<AgentProviderConfig>(() => {
    const now = Date.now();
    return {
      id: initial?.id ?? 'draft',
      descriptorId: descriptor.id,
      name: name.trim() || descriptor.name,
      baseUrl: normalizeBaseUrl(baseUrl),
      defaultModelId,
      models: [],
      storeResponses,
      createdAt: now,
      updatedAt: now,
    };
  }, [
    baseUrl,
    defaultModelId,
    descriptor.id,
    descriptor.name,
    initial?.id,
    name,
    storeResponses,
  ]);

  const previewModelId = defaultModelId || modelRows[0]?.modelId || '';

  const handleAddModel = useCallback((rawModelId: string): void => {
    const modelId = rawModelId.trim();
    if (!modelId) {
      return;
    }
    setModelRows(previous => {
      if (previous.some(row => row.modelId === modelId)) {
        return previous;
      }
      return [...previous, createModelRow(modelId)];
    });
    setAvailableModels(previous =>
      previous.filter(item => item !== modelId),
    );
    setDefaultModelId(previous => previous || modelId);
  }, []);

  const handleAddManualModel = useCallback((): void => {
    const modelId = manualModel.trim();
    if (!modelId) {
      return;
    }
    const exists = modelRows.some(row => row.modelId === modelId);
    handleAddModel(modelId);
    if (!exists) {
      setManualModel('');
    }
  }, [handleAddModel, manualModel, modelRows]);

  const handleRemoveModel = useCallback(
    (modelId: string): void => {
      const next = modelRows.filter(row => row.modelId !== modelId);
      setModelRows(next);
      if (defaultModelId === modelId) {
        setDefaultModelId(next[0]?.modelId ?? '');
      }
    },
    [defaultModelId, modelRows],
  );

  const handleUpdateRow = useCallback(
    (modelId: string, patch: Partial<ModelRowState>): void => {
      setModelRows(previous =>
        previous.map(row =>
          row.modelId === modelId ? { ...row, ...patch } : row,
        ),
      );
    },
    [],
  );

  const handleTest = useCallback(async (): Promise<void> => {
    if (!isValidBaseUrl(baseUrl)) {
      setTestResult({
        ok: false,
        message: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return;
    }
    if (!previewModelId) {
      setTestResult({ ok: false, message: '请先添加模型。' });
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
        previewProvider,
        previewModelId,
        key,
      );
      setTestResult(result);
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    } finally {
      setTesting(false);
    }
  }, [baseUrl, previewModelId, previewProvider, resolveApiKey]);

  const handleFetchModels = useCallback(async (): Promise<void> => {
    if (!isValidBaseUrl(baseUrl)) {
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
      const list = await fetchProviderModels(previewProvider, key);
      const added = new Set(modelRows.map(row => row.modelId));
      const candidates = list
        .filter(modelId => !added.has(modelId))
        .slice(0, MODEL_PREVIEW_LIMIT);
      setAvailableModels(candidates);
      if (list.length === 0) {
        setTestResult({
          ok: false,
          message: '端点没有返回模型列表，请手动添加模型。',
        });
      }
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    } finally {
      setFetchingModels(false);
    }
  }, [baseUrl, modelRows, previewProvider, resolveApiKey]);

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
    if (!isValidBaseUrl(baseUrl)) {
      toast.show({
        messageText: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return false;
    }
    if (modelRows.length === 0) {
      toast.show({ messageText: '请至少添加一个模型。' });
      return false;
    }
    const models = toModelConfigs(modelRows);
    if (!apiKey.trim() && !keyStored) {
      toast.show({ messageText: '请填写 API Key。' });
      return false;
    }

    const resolvedDefaultId = models.some(
      model => model.modelId === defaultModelId,
    )
      ? defaultModelId
      : (models[0]?.modelId ?? '');

    const draft: AgentProviderDraft = {
      descriptorId: descriptor.id,
      name,
      baseUrl,
      defaultModelId: resolvedDefaultId,
      models,
      storeResponses,
    };

    setSaving(true);
    try {
      let saved: AgentProviderConfig;
      if (initial) {
        updateProvider(initial.id, draft);
        saved = {
          ...initial,
          descriptorId: descriptor.id,
          name: name.trim() || descriptor.name,
          baseUrl: normalizeBaseUrl(baseUrl),
          defaultModelId: resolvedDefaultId,
          models,
          storeResponses,
          updatedAt: Date.now(),
        };
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
    defaultModelId,
    descriptor.id,
    descriptor.name,
    initial,
    keyStored,
    modelRows,
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
          suffix={
            <InfoHint content="填到版本路径为止，例如 https://host/v1；兼容端点不要带具体接口路径。" />
          }
          value={baseUrl}
        />

        <Input
          autoCapitalize="none"
          autoCorrect={false}
          labelText={`API Key${keyStored ? '（已填）' : ''}`}
          onChange={setApiKey}
          placeholder={keyStored ? '已保存，留空不修改' : 'sk-...'}
          secureTextEntry
          suffix={
            <InfoHint content="仅保存在系统钥匙串，不写入账本数据库；留空则保留原 Key。" />
          }
          value={apiKey}
        />

        <Divider style={styles.sectionDivider} />

        <ProviderModelSection
          availableModels={availableModels}
          defaultModelId={defaultModelId}
          manualModel={manualModel}
          modelPlaceholder={descriptor.modelPlaceholder}
          onChangeManualModel={setManualModel}
          onAddModel={handleAddModel}
          onRemoveModel={handleRemoveModel}
          onSetDefaultModel={setDefaultModelId}
          onSubmitManualModel={handleAddManualModel}
          onUpdateRow={handleUpdateRow}
          rows={modelRows}
        />

        <Divider style={styles.sectionDivider} />

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
                <Row style={styles.switchLabel}>
                  <Text size="md">服务端存储会话</Text>
                  <InfoHint content="对应 Responses 的 store 参数。第三方中转网关无法引用上一轮结果时需关闭。" />
                </Row>
                <Switch onChange={setStoreResponses} value={storeResponses} />
              </Row>
            ) : null}
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
