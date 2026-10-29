import React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react-native';
import type { BookRow } from '@pennyspring/api';

import { AgentDrawer } from './AgentDrawer';
import {
  AgentRuntimeStatusBridge,
  useAgentRuntime,
} from './useAgentRuntime';
import type { AgentSessionState } from './useAgentSession';

export interface AgentRuntimeHostProps {
  book: BookRow;
  session: AgentSessionState;
  threadId: number;
  drawerOpen: boolean;
  configured: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onOpenModelSettings: () => void;
}

export function AgentRuntimeHost({
  book,
  session,
  threadId,
  drawerOpen,
  configured,
  onDrawerOpenChange,
  onOpenSessions,
  onOpenSettings,
  onOpenModelSettings,
}: AgentRuntimeHostProps): React.ReactElement {
  const { runtime, errorText } = useAgentRuntime({
    book,
    session,
    threadId,
    initialMessages: session.initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AgentRuntimeStatusBridge onChange={session.setSending} />
      <AgentDrawer
        configured={configured}
        onOpenChange={onDrawerOpenChange}
        onOpenModelSettings={onOpenModelSettings}
        onOpenSessions={onOpenSessions}
        onOpenSettings={onOpenSettings}
        open={drawerOpen}
        runtimeErrorText={errorText}
        session={session}
      />
    </AssistantRuntimeProvider>
  );
}
