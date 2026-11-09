import React, { useCallback, useState } from 'react';
import { Button, Popup, useToast } from '@pennyspring/ui';
import type { AgentThreadRow } from '@pennyspring/api';
import { ManageConfirmDialog } from '../../components/ManageConfirmDialog';
import { AgentSessionList } from './AgentSessionList';
import { getThreadTitle } from './chatModel';
import type { AgentSessionState } from './useAgentSession';

export interface AgentSessionsPanelProps {
  open: boolean;
  chat: AgentSessionState;
  onOpenChange: (open: boolean) => void;
}

export function AgentSessionsPanel({
  open,
  chat,
  onOpenChange,
}: AgentSessionsPanelProps) {
  const toast = useToast();
  const [pendingDelete, setPendingDelete] = useState<AgentThreadRow | null>(
    null,
  );

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
          toast.show({ messageText: '已切换到新会话' });
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
        mountPoint="local"
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
        titleText="会话记录"
      >
        <AgentSessionList
          currentThreadId={chat.currentThreadId}
          disabled={chat.sending || chat.loading}
          errorText={chat.threadsError}
          loading={chat.threadsLoading}
          onDelete={setPendingDelete}
          onRetry={() => {
            chat.refreshThreads().catch(() => undefined);
          }}
          onSelect={handleSelect}
          threads={chat.threads}
        />
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
