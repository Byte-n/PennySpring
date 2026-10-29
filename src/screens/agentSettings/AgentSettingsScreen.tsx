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
import { createUseSheetStyle } from '@pennyspring/theme';
import { TrashIcon } from 'phosphor-react-native';

import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { useNavigation } from '../../navigation';
import { useAgentChatState } from '../../agent/ui/AgentChatContext';
import { AgentProviderEditor } from '../../agent/ui/AgentProviderEditor';
import {
  PROVIDER_DESCRIPTORS,
  getProviderDescriptor,
  OPENAI_RESPONSES_PROVIDER_ID,
} from '../../agent/providers/catalog';
import {
  getProviderDisplayName,
  useAgentProviderStore,
} from '../../agent/providers/configStore';
import { getProviderDefaultModel } from '../../agent/providers/models';
import { clearProviderApiKey } from '../../agent/providers/secureKey';
import type { AgentProviderConfig } from '../../agent/providers/types';
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
  intro: {
    color: token.colorTextTertiary,
  },
  cardBody: {
    gap: token.marginXS,
  },
  cardActions: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: token.marginSM,
  },
  section: {
    gap: token.marginSM,
  },
  usageRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
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

  const providers = useAgentProviderStore(state => state.providers);
  const activeProviderId = useAgentProviderStore(
    state => state.activeProviderId,
  );
  const setActiveProvider = useAgentProviderStore(
    state => state.setActiveProvider,
  );
  const removeProvider = useAgentProviderStore(state => state.removeProvider);

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

  const handleDeleteProvider = useCallback(async (): Promise<void> => {
    const target = pendingDelete;
    if (!target) {
      return;
    }
    await clearProviderApiKey(target.id);
    removeProvider(target.id);
    setPendingDelete(null);
    toast.show({ messageText: `已删除「${getProviderDisplayName(target)}」` });
  }, [pendingDelete, removeProvider, toast]);

  const handleDeleteConversation = useCallback(async (): Promise<void> => {
    await chat.deleteCurrentThread();
    setDeleteConversationOpen(false);
    toast.show({ messageText: '当前会话已删除' });
  }, [chat, toast]);

  return (
    <Column style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Column style={styles.section}>
          <Text color="secondary" size="xs" style={styles.intro}>
            API Key 只保存在系统钥匙串，不会写入账本数据库。新增提供商后会自动设为当前提供商。
          </Text>
        </Column>

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
                  <Row style={styles.cardActions}>
                    <Button
                      onPress={() => openEdit(provider)}
                      size="small"
                      type="default"
                    >
                      编辑
                    </Button>
                    <Button
                      disabled={isActive}
                      onPress={() => setActiveProvider(provider.id)}
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
                <Column style={styles.cardBody}>
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

        <Column style={styles.section}>
          <Row style={styles.usageRow}>
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
        onOpenChange={setEditorOpen}
        onSaved={() => undefined}
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
