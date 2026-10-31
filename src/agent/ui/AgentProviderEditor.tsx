import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import {
  Button,
  Column,
  Divider,
  Form,
  Icon,
  Input,
  Popup,
  Row,
  Switch,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import {
  fetchProviderModels,
  testProviderConnection,
} from '../providers/connectionTest';
import { requireProviderDescriptor } from '../providers/catalog';
import type { AgentProviderConfig } from '../providers/types';
import { isValidBaseUrl, normalizeBaseUrl } from '../core/url';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
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

interface ProviderFormValues {
  name: string;
  baseUrl: string;
  apiKey: string;
  storeResponses: boolean;
  models: ModelRowState[];
  defaultModelId: string;
}

const TypedForm = Form.infer<ProviderFormValues>();

export interface AgentProviderEditorProps {
  open: boolean;
  initial: AgentProviderConfig | null;
  descriptorId: string;
  onOpenChange: (open: boolean) => void;
  onCreated?: (provider: AgentProviderConfig) => void | Promise<void>;
}

const useStyles = createUseSheetStyle(token => ({
  body: {
    paddingBottom: token.padding,
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
  switchLabel: {
    flex: 1,
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
  onCreated,
}: AgentProviderEditorProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const toast = useToast();
  const api = useGlobalApi();
  const booksId = useBookStore(state => state.currentBook?.id ?? null);
  const bumpProviderVersion = useSyncVersionStore(
    state => state.bumpProviderVersion,
  );

  const [form] = TypedForm.useForm();
  const submitSucceededRef = useRef(false);
  const [manualModel, setManualModel] = useState('');
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
    form.reset({
      name: initial?.name ?? '',
      baseUrl: initial?.baseUrl ?? descriptor.defaultBaseUrl,
      apiKey: '',
      storeResponses: initial?.storeResponses ?? true,
      models: initial ? initial.models.map(toModelRow) : [],
      defaultModelId: initial?.defaultModelId ?? '',
    });
    setManualModel('');
    setTestResult(null);
    setAvailableModels([]);
    setAdvancedOpen(false);
    setKeyStored(false);

    if (!initial || booksId === null) {
      return;
    }

    api.credential
      .hasKey(booksId, initial.id)
      .then(hasStoredKey => {
        if (!cancelled) {
          setKeyStored(hasStoredKey);
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
  }, [api, booksId, descriptor.defaultBaseUrl, form, initial, open]);

  const resolveApiKey = useCallback(async (): Promise<string> => {
    const enteredKey = form.state.values.apiKey.trim();
    if (enteredKey) {
      return enteredKey;
    }
    if (initial && booksId !== null) {
      return api.credential.getKey(booksId, initial.id);
    }
    return '';
  }, [api, booksId, form, initial]);

  const buildPreviewProvider = useCallback((): AgentProviderConfig => {
    const values = form.state.values;
    const now = Date.now();
    return {
      id: initial?.id ?? 0,
      descriptorId: descriptor.id,
      name: values.name.trim() || descriptor.name,
      baseUrl: normalizeBaseUrl(values.baseUrl),
      defaultModelId: values.defaultModelId,
      models: [],
      storeResponses: values.storeResponses,
      createdTime: now,
      updatedTime: now,
    };
  }, [descriptor.id, descriptor.name, form, initial?.id]);

  const handleAddModel = useCallback(
    (rawModelId: string): void => {
      const modelId = rawModelId.trim();
      if (!modelId) {
        return;
      }
      form.setFieldValue('models', previous => {
        if (previous.some(row => row.modelId === modelId)) {
          return previous;
        }
        return [...previous, createModelRow(modelId)];
      });
      setAvailableModels(previous =>
        previous.filter(item => item !== modelId),
      );
      form.setFieldValue('defaultModelId', previous => previous || modelId);
    },
    [form],
  );

  const handleAddManualModel = useCallback((): void => {
    const modelId = manualModel.trim();
    if (!modelId) {
      return;
    }
    const exists = form.state.values.models.some(
      row => row.modelId === modelId,
    );
    handleAddModel(modelId);
    if (!exists) {
      setManualModel('');
    }
  }, [form, handleAddModel, manualModel]);

  const handleRemoveModel = useCallback(
    (modelId: string): void => {
      const values = form.state.values;
      const next = values.models.filter(row => row.modelId !== modelId);
      form.setFieldValue('models', next);
      if (values.defaultModelId === modelId) {
        form.setFieldValue('defaultModelId', next[0]?.modelId ?? '');
      }
    },
    [form],
  );

  const handleUpdateRow = useCallback(
    (modelId: string, patch: Partial<ModelRowState>): void => {
      form.setFieldValue('models', previous =>
        previous.map(row =>
          row.modelId === modelId ? { ...row, ...patch } : row,
        ),
      );
    },
    [form],
  );

  const handleTest = useCallback(async (): Promise<void> => {
    const values = form.state.values;
    if (!isValidBaseUrl(values.baseUrl)) {
      toast.show({
        messageText: 'Base URL 格式不正确，应形如 https://host/v1。',
        status: 'error',
      });
      return;
    }
    const previewModelId =
      values.defaultModelId || values.models[0]?.modelId || '';
    if (!previewModelId) {
      toast.show({ messageText: '请先添加模型。', status: 'error' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const key = await resolveApiKey();
      if (!key) {
        toast.show({ messageText: '请先填写 API Key。', status: 'error' });
        return;
      }
      const result = await testProviderConnection(
        buildPreviewProvider(),
        previewModelId,
        key,
      );
      toast.show({
        messageText: result.message,
        status: result.ok ? 'success' : 'error',
      });
    } catch (error) {
      toast.show({
        messageText: getErrorMessage(error),
        status: 'error',
      });
    } finally {
      setTesting(false);
    }
  }, [buildPreviewProvider, form, resolveApiKey, toast]);

  const handleFetchModels = useCallback(async (): Promise<void> => {
    const values = form.state.values;
    if (!isValidBaseUrl(values.baseUrl)) {
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
      const list = await fetchProviderModels(buildPreviewProvider(), key);
      const added = new Set(values.models.map(row => row.modelId));
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
  }, [buildPreviewProvider, form, resolveApiKey]);

  const handleClearKey = useCallback(async (): Promise<void> => {
    if (!initial || booksId === null) {
      form.setFieldValue('apiKey', '');
      setKeyStored(false);
      return;
    }
    try {
      await api.credential.setKey(booksId, initial.id, '');
      bumpProviderVersion();
      setKeyStored(false);
      form.setFieldValue('apiKey', '');
      setTestResult({ ok: true, message: '已清除保存的 API Key。' });
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    }
  }, [api, booksId, bumpProviderVersion, form, initial]);

  const handleFinish = useCallback(
    async (values: ProviderFormValues) => {
      submitSucceededRef.current = false;
      const models = toModelConfigs(values.models);
      const resolvedDefaultId = models.some(
        model => model.modelId === values.defaultModelId,
      )
        ? values.defaultModelId
        : (models[0]?.modelId ?? '');

      const input = {
        descriptorId: descriptor.id,
        name: values.name.trim() || descriptor.name,
        baseUrl: normalizeBaseUrl(values.baseUrl),
        defaultModelId: resolvedDefaultId,
        models,
        storeResponses: values.storeResponses,
      };

      setSaving(true);
      try {
        const saved = initial
          ? await api.provider.update({ ...input, id: initial.id })
          : await api.provider.create(input);
        bumpProviderVersion();

        if (values.apiKey.trim()) {
          if (booksId === null) {
            throw new Error('请先选择账本');
          }
          await api.credential.setKey(booksId, saved.id, values.apiKey);
          bumpProviderVersion();
          setKeyStored(true);
          form.setFieldValue('apiKey', '');
        }

        if (!initial) {
          await onCreated?.(saved);
        }

        submitSucceededRef.current = true;
        toast.show({ messageText: 'AI 提供商已保存' });
        onOpenChange(false);
      } catch (error) {
        setTestResult({ ok: false, message: getErrorMessage(error) });
      } finally {
        setSaving(false);
      }
    },
    [
      api,
      booksId,
      bumpProviderVersion,
      descriptor.id,
      descriptor.name,
      form,
      initial,
      onOpenChange,
      onCreated,
      toast,
    ],
  );

  const handlePanelOk = useCallback(async () => {
    submitSucceededRef.current = false;
    await form.handleSubmit();
    return submitSucceededRef.current;
  }, [form]);

  return (
    <Popup.FloatingPanel
      bodyScrollable
      scrollEnabled
      cancelText="关闭"
      height="82%"
      keyboardAvoiding
      okDisabled={saving}
      okLoading={saving}
      okText="保存"
      onOk={handlePanelOk}
      onOpenChange={onOpenChange}
      open={open}
      titleText={initial ? '编辑提供商' : '添加提供商'}
    >
      <TypedForm
        form={form}
        labelMode="child"
        onFinish={handleFinish}
        style={styles.body} gap={token.marginMD}
      >
        <Text color="secondary" size="xs">
          {descriptor.description}
        </Text>

        <TypedForm.Item name="name" labelText="名称">
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={descriptor.name}
          />
        </TypedForm.Item>

        <TypedForm.Item
          name="baseUrl"
          labelText="Base URL"
          rules={value =>
            isValidBaseUrl(value)
              ? undefined
              : 'Base URL 格式不正确，应形如 https://host/v1。'
          }
        >
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={descriptor.baseUrlHint}
            suffix={
              <InfoHint content="填到版本路径为止，例如 https://host/v1；兼容端点不要带具体接口路径。" />
            }
          />
        </TypedForm.Item>

        <TypedForm.Item
          name="apiKey"
          labelText={`API Key${keyStored ? '（已填）' : ''}`}
          rules={value =>
            keyStored || value.trim() ? undefined : '请填写 API Key。'
          }
        >
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            placeholder={keyStored ? '已保存，留空不修改' : 'sk-...'}
            secureTextEntry
            suffix={
              <InfoHint content="随账本保存在账本所在服务器，当前为明文存储；请勿在共享服务器使用敏感 Key。留空则保留原 Key。" />
            }
          />
        </TypedForm.Item>

        <Divider spacing="none" />

        <TypedForm.Subscribe selector={state => state.values}>
          {values => (
            <ProviderModelSection
              availableModels={availableModels}
              defaultModelId={values.defaultModelId}
              manualModel={manualModel}
              modelPlaceholder={descriptor.modelPlaceholder}
              onChangeManualModel={setManualModel}
              onAddModel={handleAddModel}
              onRemoveModel={handleRemoveModel}
              onSetDefaultModel={modelId =>
                form.setFieldValue('defaultModelId', modelId)
              }
              onSubmitManualModel={handleAddManualModel}
              onUpdateRow={handleUpdateRow}
              rows={values.models}
            />
          )}
        </TypedForm.Subscribe>

        <TypedForm.Item
          name="models"
          noStyle
          rules={value =>
            (value?.length ?? 0) === 0 ? '请至少添加一个模型' : undefined
          }
        >
          {null}
        </TypedForm.Item>

        <Divider spacing="none" />

        <Row gap="normal" align="center" wrap>
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
          <Column gap="small">
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
              <TypedForm.Item name="storeResponses" noStyle>
                <Row gap="normal" align="center">
                  <Row style={styles.switchLabel} gap={token.marginXXS} align="center">
                    <Text size="md">服务端存储会话</Text>
                    <InfoHint content="对应 Responses 的 store 参数。第三方中转网关无法引用上一轮结果时需关闭。" />
                  </Row>
                  <Switch />
                </Row>
              </TypedForm.Item>
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
      </TypedForm>
    </Popup.FloatingPanel>
  );
}
