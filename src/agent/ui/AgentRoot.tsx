import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@pennyspring/ui';

import { useBookStore } from '../../stores/bookStore';
import { getAgentConfig, rehydrateAgentConfig } from '../adapters/configStore';
import { loadApiKey } from '../adapters/secureKey';
import { AgentDrawer } from './AgentDrawer';
import {
  AgentLauncherContext,
  type AgentLauncher,
} from './AgentLauncherContext';
import { AgentSettingsPanel } from './AgentSettingsPanel';
import { useAgentChat } from './useAgentChat';

const REMOTE_MODE_MESSAGE = '当前为远程账本模式，助手不可用';

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
  const toast = useToast();
  const book = useBookStore(state => state.currentBook);
  const bookRef = useBookStore(state => state.currentBookRef);

  const isRemote = bookRef?.kind === 'remote';
  const chat = useAgentChat({
    book,
    enabled: Boolean(book) && !isRemote,
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configured, setConfigured] = useState(false);

  const refreshConfigured = useCallback(async (): Promise<void> => {
    const config = getAgentConfig();
    let hasKey = false;
    try {
      hasKey = Boolean(await loadApiKey());
    } catch {
      hasKey = false;
    }
    setConfigured(Boolean(config.baseUrl && config.model && hasKey));
  }, []);

  useEffect(() => {
    rehydrateAgentConfig()
      .then(refreshConfigured)
      .catch(() => undefined);
  }, [refreshConfigured]);

  useEffect(() => {
    if (drawerOpen) {
      refreshConfigured().catch(() => undefined);
    }
  }, [drawerOpen, refreshConfigured]);

  const handleOpen = useCallback((): void => {
    if (isRemote) {
      toast.show({ messageText: REMOTE_MODE_MESSAGE });
      return;
    }
    setDrawerOpen(true);
  }, [isRemote, toast]);

  const handleOpenSettings = useCallback((): void => {
    setSettingsOpen(true);
  }, []);

  const launcher = useMemo<AgentLauncher>(
    () => ({ openAgent: handleOpen }),
    [handleOpen],
  );

  return (
    <AgentLauncherContext.Provider value={launcher}>
      {children}
      {book && !isRemote ? (
        <AgentErrorBoundary>
          <AgentDrawer
            chat={chat}
            configured={configured}
            onOpenChange={setDrawerOpen}
            onOpenSettings={handleOpenSettings}
            open={drawerOpen}
          />
          <AgentSettingsPanel
            onClearConversation={chat.clear}
            onOpenChange={setSettingsOpen}
            onSaved={() => {
              refreshConfigured().catch(() => undefined);
            }}
            open={settingsOpen}
            usage={chat.usage}
          />
        </AgentErrorBoundary>
      ) : null}
    </AgentLauncherContext.Provider>
  );
}
