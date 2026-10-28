import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Column,
  Divider,
  Input,
  Popup,
  Row,
  Text,
  useToast,
} from '@pennyspring/ui';
import type { TokenUsage } from '../core/types';
import { createUseSheetStyle } from '@pennyspring/theme';
import { TrashIcon } from 'phosphor-react-native';

import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { getAgentConfig, useAgentConfigStore } from '../adapters/configStore';
import { testAgentConnection } from '../adapters/connectionTest';
import { clearApiKey, loadApiKey, saveApiKey } from '../adapters/secureKey';
import { isValidBaseUrl, normalizeBaseUrl } from '../core/url';
import { formatTokenCount } from './chatModel';

interface ConnectionResult {
  ok: boolean;
  message: string;
}

export interface AgentSettingsPanelProps {
  open: boolean;
  usage: TokenUsage;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onDeleteConversation: () => Promise<void>;
}

const useStyles = createUseSheetStyle(token => ({
  body: {
    gap: token.marginMD,
    paddingBottom: token.padding,
  },
  hint: {
    color: token.colorTextTertiary,
  },
  actions: {
    alignItems: 'center',
    gap: token.marginSM,
  },
  testResult: {
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
  },
  testSuccess: {
    backgroundColor: token.colorSuccessBg,
  },
  testError: {
    backgroundColor: token.colorErrorBg,
  },
  usageRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerAction: {
    alignSelf: 'flex-start',
  },
}));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '操作失败，请稍后再试。';
}

export function AgentSettingsPanel({
  open,
  usage,
  onOpenChange,
  onSaved,
  onDeleteConversation,
}: AgentSettingsPanelProps) {
  const styles = useStyles();
  const toast = useToast();
  const setConfig = useAgentConfigStore(state => state.setConfig);

  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyStored, setKeyStored] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    const config = getAgentConfig();
    setBaseUrl(config.baseUrl);
    setModel(config.model);
    setApiKey('');
    setTestResult(null);
    setDeleteOpen(false);

    loadApiKey()
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
  }, [open]);

  const handleTest = useCallback(async (): Promise<void> => {
    const normalizedBase = normalizeBaseUrl(baseUrl);
    if (!isValidBaseUrl(normalizedBase)) {
      setTestResult({
        ok: false,
        message: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return;
    }

    let key = apiKey.trim();
    if (!key) {
      try {
        key = (await loadApiKey()) ?? '';
      } catch (error) {
        setTestResult({ ok: false, message: getErrorMessage(error) });
        return;
      }
    }
    if (!key) {
      setTestResult({ ok: false, message: '请先填写 API Key。' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const result = await testAgentConnection({
      baseUrl: normalizedBase,
      apiKey: key,
    });
    setTestResult(result);
    setTesting(false);
  }, [apiKey, baseUrl]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    const normalizedBase = normalizeBaseUrl(baseUrl);
    const normalizedModel = model.trim();
    const draftKey = apiKey.trim();

    if (!isValidBaseUrl(normalizedBase)) {
      toast.show({
        messageText: 'Base URL 格式不正确，应形如 https://host/v1。',
      });
      return false;
    }
    if (!normalizedModel) {
      toast.show({ messageText: '请填写模型名称。' });
      return false;
    }
    if (!draftKey && !keyStored) {
      toast.show({ messageText: '请填写 API Key。' });
      return false;
    }

    setSaving(true);
    try {
      if (draftKey) {
        await saveApiKey(draftKey);
        setKeyStored(true);
        setApiKey('');
      }
      setConfig({ baseUrl: normalizedBase, model: normalizedModel });
      setBaseUrl(normalizedBase);
      setModel(normalizedModel);
      onSaved();
      toast.show({ messageText: '助手设置已保存' });
      onOpenChange(false);
      return true;
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
      return false;
    } finally {
      setSaving(false);
    }
  }, [apiKey, baseUrl, keyStored, model, onOpenChange, onSaved, setConfig, toast]);

  const handleClearKey = useCallback(async (): Promise<void> => {
    try {
      await clearApiKey();
      setKeyStored(false);
      setApiKey('');
      setTestResult({ ok: true, message: '已清除保存的 API Key。' });
    } catch (error) {
      setTestResult({ ok: false, message: getErrorMessage(error) });
    }
  }, []);

  const handleDeleteConversation = useCallback(async (): Promise<void> => {
    await onDeleteConversation();
    setDeleteOpen(false);
    toast.show({ messageText: '会话已删除' });
  }, [onDeleteConversation, toast]);

  return (
    <>
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
        titleText="助手设置"
      >
        <Column style={styles.body}>
          <Text color="secondary" size="xs">
            填写 OpenAI-compatible 接口信息。API Key 只保存在系统钥匙串，不会写入账本数据库。
          </Text>

          <Input
            autoCapitalize="none"
            autoCorrect={false}
            labelText="Base URL"
            onChange={setBaseUrl}
            placeholder="https://host/v1"
            value={baseUrl}
          />

          <Input
            autoCapitalize="none"
            autoCorrect={false}
            labelText="模型名称"
            onChange={setModel}
            placeholder="例如 gpt-4o-mini"
            value={model}
          />

          <Input
            autoCapitalize="none"
            autoCorrect={false}
            helperText={
              keyStored
                ? '已保存到系统钥匙串，留空则不修改。'
                : '仅保存在系统钥匙串。'
            }
            labelText="API Key"
            onChange={setApiKey}
            placeholder={keyStored ? '已保存' : 'sk-...'}
            secureTextEntry
            value={apiKey}
          />

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
              disabled={!keyStored}
              onPress={handleClearKey}
              size="small"
              type="text"
            >
              清除已保存 Key
            </Button>
          </Row>

          {testResult ? (
            <Column
              style={[
                styles.testResult,
                testResult.ok ? styles.testSuccess : styles.testError,
              ]}
            >
              <Text
                color={testResult.ok ? 'successText' : 'errorText'}
                size="xs"
              >
                {testResult.message}
              </Text>
            </Column>
          ) : null}

          <Divider />

          <Row style={styles.usageRow}>
            <Text color="secondary" size="xs">
              累计 token
            </Text>
            <Text size="xs">
              {formatTokenCount(usage.totalTokens)}（输入{' '}
              {formatTokenCount(usage.promptTokens)} / 输出{' '}
              {formatTokenCount(usage.completionTokens)}）
            </Text>
          </Row>

          <Button
            color="danger"
            icon={TrashIcon}
            onPress={() => setDeleteOpen(true)}
            size="small"
            style={styles.dangerAction}
            type="text"
          >
            删除当前会话
          </Button>
        </Column>
      </Popup.FloatingPanel>

      <ManageConfirmDialog
        messageText="将删除当前会话及其全部消息，删除后不可恢复。"
        okText="删除"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConversation}
        open={deleteOpen}
        titleText="删除会话"
      />
    </>
  );
}
