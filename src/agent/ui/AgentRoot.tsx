import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useBookStore } from '../../stores/bookStore';
import { ROOT_ROUTES, rootNavigationRef } from '../../navigation';
import {
  getActiveAgentProvider,
  rehydrateAgentProviders,
  useAgentProviderStore,
} from '../providers/configStore';
import { hasProviderApiKey } from '../providers/secureKey';
import { AgentChatContext } from './AgentChatContext';
import { AgentDrawerFallback } from './AgentDrawerFallback';
import {
  AgentLauncherContext,
  type AgentLauncher,
} from './AgentLauncherContext';
import { AgentRuntimeHost } from './AgentRuntimeHost';
import { AgentSessionsPanel } from './AgentSessionsPanel';
import { useAgentSession } from './useAgentSession';

interface AgentErrorBoundaryState {
  failed: boolean;
}

class AgentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AgentErrorBoundaryState
> {
  state: AgentErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AgentErrorBoundaryState {
    return { failed: true };
  }

  render(): React.ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

interface AgentRootProps {
  children: React.ReactNode;
}

export function AgentRoot({ children }: AgentRootProps) {
  const book = useBookStore(state => state.currentBook);

  const session = useAgentSession({
    book,
    enabled: Boolean(book),
  });

  const providers = useAgentProviderStore(state => state.providers);
  const activeProviderId = useAgentProviderStore(
    state => state.activeProviderId,
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [configured, setConfigured] = useState(false);

  const refreshConfigured = useCallback(async (): Promise<void> => {
    const provider = getActiveAgentProvider();
    if (provider === null) {
      setConfigured(false);
      return;
    }
    try {
      setConfigured(await hasProviderApiKey(provider.id));
    } catch {
      setConfigured(false);
    }
  }, []);

  useEffect(() => {
    rehydrateAgentProviders()
      .then(refreshConfigured)
      .catch(() => undefined);
  }, [refreshConfigured]);

  useEffect(() => {
    refreshConfigured().catch(() => undefined);
  }, [activeProviderId, providers, refreshConfigured]);

  useEffect(() => {
    if (drawerOpen) {
      refreshConfigured().catch(() => undefined);
    }
  }, [drawerOpen, refreshConfigured]);

  const handleOpen = useCallback((): void => {
    setDrawerOpen(true);
  }, []);

  const handleOpenSettings = useCallback((): void => {
    setDrawerOpen(false);
    if (rootNavigationRef.isReady()) {
      rootNavigationRef.navigate(ROOT_ROUTES.AgentSettings);
    }
  }, []);

  const handleOpenSessions = useCallback((): void => {
    setSessionsOpen(true);
  }, []);

  const launcher = useMemo<AgentLauncher>(
    () => ({ openAgent: handleOpen }),
    [handleOpen],
  );

  const threadId = session.currentThreadId;

  return (
    <AgentLauncherContext.Provider value={launcher}>
      <AgentChatContext.Provider value={session}>
        {children}
        {book ? (
          <AgentErrorBoundary>
            {threadId === null ? (
              <AgentDrawerFallback
                errorText={session.errorText}
                onOpenChange={setDrawerOpen}
                onOpenSessions={handleOpenSessions}
                onOpenSettings={handleOpenSettings}
                open={drawerOpen}
              />
            ) : (
              <AgentRuntimeHost
                key={`${book.id}:${threadId}`}
                book={book}
                configured={configured}
                drawerOpen={drawerOpen}
                onDrawerOpenChange={setDrawerOpen}
                onOpenSessions={handleOpenSessions}
                onOpenSettings={handleOpenSettings}
                session={session}
                threadId={threadId}
              />
            )}
            <AgentSessionsPanel
              chat={session}
              onOpenChange={setSessionsOpen}
              open={sessionsOpen}
            />
          </AgentErrorBoundary>
        ) : null}
      </AgentChatContext.Provider>
    </AgentLauncherContext.Provider>
  );
}
