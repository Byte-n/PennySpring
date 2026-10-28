import React, { useCallback, useState } from 'react';
import { Button, Column, Popup, useToast } from '@pennyspring/ui';
import type { AgentThreadRow } from '@pennyspring/api';
import { createUseSheetStyle } from '@pennyspring/theme';

import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { AgentSessionList } from './AgentSessionList';
import { getThreadTitle } from './chatModel';
import type { AgentChatState } from './useAgentChat';

const useStyles = createUseSheetStyle(token => ({
  panelBody: {
    padding: 0,
  },
  body: {
    flex: 1,
    padding: token.paddingMD,
  },
}));

export interface AgentSessionsPanelProps {
  open: boolean;
  chat: AgentChatState;
  onOpenChange: (open: boolean) => void;
}

export function AgentSessionsPanel({
  open,
  chat,
  onOpenChange,
}: AgentSessionsPanelProps) {
  const styles = useStyles();
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<AgentThreadRow | null>(null);

  const handleSelect = useCallback(
    (thread: AgentThreadRow): void => {
      onOpenChange(false);
      chat.selectThread(thread.id).catch(() => undefined);
    },
    [chat, onOpenChange],
  );

  const handleCreate = useCallback((): void => {
    onOpenChange(false);
    chat
      .createThread()
      .then(created => {
        if (created) {
          toast.show({ messageText: '已新建会话' });
        }
      })
      .catch(() => undefined);
  }, [chat, onOpenChange, toast]);

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
    <>
      <Popup.FloatingPanel
        bodyScrollable={false}
        height="70%"
        onOpenChange={onOpenChange}
        open={open}
        position="bottom"
        renderFooter={null}
        renderHeaderRight={() => (
          <Button
            disabled={chat.sending}
            onPress={handleCreate}
            size="small"
            testID="agent-session-create"
            type="text"
          >
            新建
          </Button>
        )}
        styles={{ panelBody: styles.panelBody }}
        titleText="会话记录"
      >
        <Column style={styles.body}>
          <AgentSessionList
            currentThreadId={chat.currentThreadId}
            disabled={chat.sending || chat.loading}
            loading={chat.threadsLoading}
            onDelete={setPendingDelete}
            onSelect={handleSelect}
            threads={chat.threads}
          />
        </Column>
      </Popup.FloatingPanel>

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
    </>
  );
}
