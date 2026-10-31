import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  ActionSheet,
  Button,
  Card,
  Column,
  Divider,
  Empty,
  Row,
  Tag,
  Text,
  useToast,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import { TrashIcon } from 'phosphor-react-native';

import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { useNavigation } from '../../navigation';
import { ROOT_ROUTES } from '../../navigation/routes';
import { useAgentChatState } from '../../agent/ui/AgentChatContext';
import { AgentProviderEditor } from '../../agent/ui/AgentProviderEditor';
import {
  PROVIDER_DESCRIPTORS,
  getProviderDescriptor,
  OPENAI_RESPONSES_PROVIDER_ID,
} from '../../agent/providers/catalog';
import { getProviderDisplayName } from '../../agent/providers/display';
import { getProviderDefaultModel } from '../../agent/providers/models';
import type { AgentProviderConfig } from '../../agent/providers/types';
import {
  EMPTY_AGENT_SELECTION,
  useProviderSelection,
  useProviders,
} from '../../agent/providers/useProviders';
import { useGlobalApi } from '../../stores/bookStore';
import { useSyncVersionStore } from '../../stores/syncVersionStore';
import { formatTokenCount } from '../../agent/core/messages';

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
  dangerAction: {
    alignSelf: 'flex-start',
  },
}));

export function AgentSettingsScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const chat = useAgentChatState();

  const api = useGlobalApi();
  const bumpProviderVersion = useSyncVersionStore(
    state => state.bumpProviderVersion,
  );
  const { data: providers = [] } = useProviders();
  const { data: selection = EMPTY_AGENT_SELECTION } = useProviderSelection();
  const activeProviderId = selection.providerId;

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorInitial, setEditorInitial] =
    useState<AgentProviderConfig | null>(null);
  const [editorDescriptorId, setEditorDescriptorId] = useState(
    OPENAI_RESPONSES_PROVIDER_ID,
  );
  const [pendingDelete, setPendingDelete] =
    useState<AgentProviderConfig | null>(null);
  const [deleteConversationOpen, setDeleteConversationOpen] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: createHeaderAddButton(() => setAddSheetOpen(true)),
    });
  }, [navigation]);

  const openCreate = useCallback((descriptorId: string): void => {
    setAddSheetOpen(false);
    setEditorInitial(null);
    setEditorDescriptorId(descriptorId);
    setEditorOpen(true);
  }, []);

  const openEdit = useCallback((provider: AgentProviderConfig): void => {
    setEditorInitial(provider);
    setEditorDescriptorId(provider.descriptorId);
    setEditorOpen(true);
  }, []);

  const handleAddAction = useCallback(
    (_action: unknown, index: number): void => {
      const descriptor = PROVIDER_DESCRIPTORS[index];
      if (descriptor) {
        openCreate(descriptor.id);
      }
    },
    [openCreate],
  );

  const handleSetActiveProvider = useCallback(
    async (provider: AgentProviderConfig): Promise<void> => {
      try {
        const modelId = getProviderDefaultModel(provider)?.modelId ?? '';
        await api.provider.setSelection({
          providerId: provider.id,
          modelId,
        });
        bumpProviderVersion();
        toast.show({
          messageText: `已将「${getProviderDisplayName(provider)}」设为当前提供商`,
        });
      } catch (error) {
        toast.show({
          messageText:
            error instanceof Error ? error.message : '设置当前提供商失败',
          status: 'error',
        });
      }
    },
    [api, bumpProviderVersion, toast],
  );

  const handleDeleteProvider = useCallback(async (): Promise<void> => {
    const target = pendingDelete;
    if (!target) {
      return;
    }
    try {
      await api.provider.delete(target.id);
      bumpProviderVersion();
      setPendingDelete(null);
      toast.show({ messageText: `已删除「${getProviderDisplayName(target)}」` });
    } catch (error) {
      toast.show({
        messageText:
          error instanceof Error ? error.message : '删除提供商失败',
        status: 'error',
      });
    }
  }, [api, bumpProviderVersion, pendingDelete, toast]);

  const handleDeleteConversation = useCallback(async (): Promise<void> => {
    await chat.deleteCurrentThread();
    setDeleteConversationOpen(false);
    toast.show({ messageText: '当前会话已删除' });
  }, [chat, toast]);

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled>
        <Column gap="normal">
          <Text color="tertiary" size="xs" >
            提供商配置与 API Key 保存在账本所在服务器；API Key 暂为明文存储，请勿在共享服务器使用敏感 Key。
          </Text>
        </Column>

        <Card
          footer={
            <Button
              onPress={() => navigation.navigate(ROOT_ROUTES.QuickBookSettings)}
              size="small"
              type="default"
            >
              配置 AI 记账
            </Button>
          }
          titleText="AI 记账"
          variant="plain"
        >
          <Text color="secondary" size="xs">
            截图后由助手识别并记账。需要选择支持图片的提供商与模型，并授予相册读取权限。
          </Text>
        </Card>

        {providers.length === 0 ? (
          <Empty descriptionText="还没有 AI 提供商，点击右上角添加。" />
        ) : (
          providers.map(provider => {
            const descriptor = getProviderDescriptor(provider.descriptorId);
            const isActive = provider.id === activeProviderId;
            return (
              <Card
                key={provider.id}
                footer={
                  <Row gap="normal" align="center" wrap>
                    <Button
                      onPress={() => openEdit(provider)}
                      size="small"
                      type="default"
                    >
                      编辑
                    </Button>
                    <Button
                      disabled={isActive}
                      onPress={() => {
                        handleSetActiveProvider(provider).catch(() => undefined);
                      }}
                      size="small"
                      type="text"
                    >
                      设为当前
                    </Button>
                    <Button
                      color="danger"
                      icon={TrashIcon}
                      onPress={() => setPendingDelete(provider)}
                      size="small"
                      type="text"
                    >
                      删除
                    </Button>
                  </Row>
                }
                extra={
                  isActive ? (
                    <Tag color="success" size="small">
                      当前
                    </Tag>
                  ) : null
                }
                titleText={getProviderDisplayName(provider)}
                variant="plain"
              >
                <Column gap="small">
                  {descriptor && descriptor.name !== getProviderDisplayName(provider) ? (
                    <Text color="secondary" size="xs">
                      {descriptor.name}
                    </Text>
                  ) : null}
                  <Text size="xs">{provider.baseUrl}</Text>
                  <Text color="secondary" size="xs">
                    默认模型：{getProviderDefaultModel(provider)?.modelId ?? '未设置'}
                    （共 {provider.models.length} 个）
                  </Text>
                </Column>
              </Card>
            );
          })
        )}

        <Divider />

        <Column gap="normal">
          <Row align="center" justify="between">
            <Text color="secondary" size="xs">
              累计 token
            </Text>
            <Text size="xs">
              {formatTokenCount(chat.usage.totalTokens)}（输入{' '}
              {formatTokenCount(chat.usage.promptTokens)} / 输出{' '}
              {formatTokenCount(chat.usage.completionTokens)}）
            </Text>
          </Row>
          <Button
            color="danger"
            icon={TrashIcon}
            onPress={() => setDeleteConversationOpen(true)}
            size="small"
            style={styles.dangerAction}
            type="text"
          >
            删除当前会话
          </Button>
        </Column>
      </ScrollView>

      <ActionSheet
        actions={PROVIDER_DESCRIPTORS.map(descriptor => ({
          text: descriptor.name,
        }))}
        onAction={handleAddAction}
        onOpenChange={setAddSheetOpen}
        open={addSheetOpen}
        titleText="添加 AI 提供商"
      />

      <AgentProviderEditor
        descriptorId={editorDescriptorId}
        initial={editorInitial}
        onCreated={provider => {
          if (providers.length === 0) {
            return handleSetActiveProvider(provider);
          }
        }}
        onOpenChange={setEditorOpen}
        open={editorOpen}
      />

      <ManageConfirmDialog
        messageText="将删除该提供商配置及其保存的 API Key。"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDeleteProvider}
        open={pendingDelete !== null}
        titleText={
          pendingDelete
            ? `删除「${getProviderDisplayName(pendingDelete)}」？`
            : '删除提供商'
        }
      />

      <ManageConfirmDialog
        messageText="将删除当前会话及其全部消息，删除后不可恢复。"
        okText="删除"
        onCancel={() => setDeleteConversationOpen(false)}
        onConfirm={handleDeleteConversation}
        open={deleteConversationOpen}
        titleText="删除会话"
      />
    </Column>
  );
}
