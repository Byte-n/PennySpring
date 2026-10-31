import React from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react-native';
import type { BookRow } from '@pennyspring/api';

import type { PendingQuickBookMessage } from '../../features/quickBook/types';
import { AgentDebugProbe } from './AgentDebugProbe';
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
  pendingQuickBook: PendingQuickBookMessage | null;
  onPendingQuickBookSent: () => void;
  onDrawerOpenChange: (open: boolean) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  onOpenModelSettings: (providerId?: string) => void;
}

export function AgentRuntimeHost({
  book,
  session,
  threadId,
  drawerOpen,
  configured,
  pendingQuickBook,
  onPendingQuickBookSent,
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
      {__DEV__ ? <AgentDebugProbe /> : null}
      <AgentRuntimeStatusBridge onChange={session.setSending} />
      <AgentDrawer
        configured={configured}
        onOpenChange={onDrawerOpenChange}
        onOpenModelSettings={onOpenModelSettings}
        onOpenSessions={onOpenSessions}
        onOpenSettings={onOpenSettings}
        onPendingQuickBookSent={onPendingQuickBookSent}
        open={drawerOpen}
        pendingQuickBook={pendingQuickBook}
        runtimeErrorText={errorText}
        session={session}
      />
    </AssistantRuntimeProvider>
  );
}
