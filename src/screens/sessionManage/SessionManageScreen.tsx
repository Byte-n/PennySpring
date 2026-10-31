import React, { useCallback, useLayoutEffect, useState } from 'react';
import { Column, useToast } from '@pennyspring/ui';
import type { AgentThreadRow } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/ui';

import { useAgentChatState } from '../../agent/ui/AgentChatContext';
import { useAgentLauncher } from '../../agent/ui/AgentLauncherContext';
import { AgentSessionList } from '../../agent/ui/AgentSessionList';
import { getThreadTitle } from '../../agent/ui/chatModel';
import { createHeaderAddButton } from '../../components/HeaderAddButton';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { useNavigation } from '../../navigation';

const useStyles = createUseSheetStyle(token => ({
  container: {
    backgroundColor: token.colorBgLayout,
    flex: 1,
  },
  content: {
    padding: token.padding,
    paddingBottom: token.paddingXL,
  },
}));

export function SessionManageScreen() {
  const styles = useStyles();
  const toast = useToast();
  const navigation = useNavigation();
  const chat = useAgentChatState();
  const { openAgent } = useAgentLauncher();
  const [pendingDelete, setPendingDelete] = useState<AgentThreadRow | null>(null);

  const handleCreate = useCallback((): void => {
    if (chat.sending) {
      toast.show({ messageText: '请先等待当前回答结束' });
      return;
    }
    chat
      .createThread()
      .then(created => {
        if (created) {
          navigation.goBack();
          openAgent();
        }
      })
      .catch(() => undefined);
  }, [chat, navigation, openAgent, toast]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: createHeaderAddButton(handleCreate) });
  }, [navigation, handleCreate]);

  const handleSelect = useCallback(
    async (thread: AgentThreadRow): Promise<void> => {
      const restored = await chat.selectThread(thread.id);
      if (!restored) {
        return;
      }
      toast.show({ messageText: `已恢复「${getThreadTitle(thread)}」` });
      navigation.goBack();
      openAgent();
    },
    [chat, navigation, openAgent, toast],
  );

  const handleDelete = useCallback(async (): Promise<void> => {
    const target = pendingDelete;
    if (!target) {
      return;
    }
    await chat.deleteThread(target.id);
    setPendingDelete(null);
    toast.show({ messageText: `已删除「${getThreadTitle(target)}」` });
  }, [chat, pendingDelete, toast]);

  return (
    <Column style={styles.container}>
      <AgentSessionList
        contentStyle={styles.content}
        currentThreadId={chat.currentThreadId}
        disabled={chat.sending || chat.loading}
        loading={chat.threadsLoading}
        onDelete={setPendingDelete}
        onSelect={handleSelect}
        threads={chat.threads}
      />

      <ManageConfirmDialog
        messageText="将删除这条会话及其全部消息，删除后不可恢复。"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        open={pendingDelete !== null}
        titleText={
          pendingDelete
            ? `删除「${getThreadTitle(pendingDelete)}」？`
            : '删除会话'
        }
      />
    </Column>
  );
}
