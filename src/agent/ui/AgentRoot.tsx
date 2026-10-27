import React, { useCallback, useEffect, useState } from 'react';
import { FloatingActionGroup, useToast } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/theme';
import { SparkleIcon } from 'phosphor-react-native';

import { ROOT_ROUTES, useNavigation } from '../../navigation';
import { useBookStore } from '../../stores/bookStore';
import { getAgentConfig, rehydrateAgentConfig } from '../adapters/configStore';
import { loadApiKey } from '../adapters/secureKey';
import { AgentDrawer } from './AgentDrawer';
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

function useCurrentRouteName(): string {
  const navigation = useNavigation();
  const readRouteName = useCallback((): string => {
    const state = navigation.getState();
    return state?.routes[state.index]?.name ?? '';
  }, [navigation]);
  const [routeName, setRouteName] = useState(readRouteName);

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      setRouteName(readRouteName());
    });
    return unsubscribe;
  }, [navigation, readRouteName]);

  return routeName;
}

function AgentOverlay() {
  const { token } = useTheme();
  const toast = useToast();
  const book = useBookStore(state => state.currentBook);
  const bookRef = useBookStore(state => state.currentBookRef);
  const routeName = useCurrentRouteName();

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

  if (!book) {
    return null;
  }

  const fabOffset =
    token.paddingLG + token.controlHeight * 2 + token.paddingXS * 2;

  return (
    <>
      {routeName === ROOT_ROUTES.Home ? (
        <FloatingActionGroup
          actions={[
            {
              key: 'agent',
              icon: SparkleIcon,
              onPress: handleOpen,
              buttonProps: { type: 'primary' },
            },
          ]}
          offset={{ y: fabOffset }}
          placement="bottomRight"
        />
      ) : null}

      {isRemote ? null : (
        <>
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
        </>
      )}
    </>
  );
}

export function AgentRoot() {
  return (
    <AgentErrorBoundary>
      <AgentOverlay />
    </AgentErrorBoundary>
  );
}
