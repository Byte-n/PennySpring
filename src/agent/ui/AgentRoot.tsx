import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Column, useToast } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

import { DEFAULT_QUICK_BOOK_PROMPT } from '../../features/quickBook/constants';
import {
  toQuickBookAttachment,
  toQuickBookFilePart,
} from '../../features/quickBook/imagePayload';
import {
  getQuickBookSettings,
  rehydrateQuickBookSettings,
  useQuickBookSettingsStore,
} from '../../features/quickBook/settingsStore';
import { rehydrateQuickBookRuntime } from '../../features/quickBook/runtimeStore';
import { buildQuickBookThreadTitle } from '../../features/quickBook/title';
import type {
  PendingQuickBookMessage,
  QuickBookConfigErrorReason,
  QuickBookImage,
  QuickBookSource,
  QuickBookStartResult,
} from '../../features/quickBook/types';
import { useQuickBookShare } from '../../features/quickBook/useQuickBookShare';
import { useScreenshotNudge } from '../../features/quickBook/useScreenshotNudge';
import { resolveQuickBookModel } from '../../features/quickBook/validation';
import { ROOT_ROUTES, rootNavigationRef } from '../../navigation';
import { useBookStore } from '../../stores/bookStore';
import {
  getActiveAgentProvider,
  getAgentProvider,
  rehydrateAgentProviders,
  useAgentProviderStore,
} from '../providers/configStore';
import {
  rehydrateThreadModelSelections,
  rememberThreadModel,
  useThreadModelStore,
} from '../providers/modelSelectionStore';
import { hasProviderApiKey } from '../providers/secureKey';
import { AgentChatContext } from './AgentChatContext';
import { AgentDrawerFallback } from './AgentDrawerFallback';
import {
  AgentLauncherContext,
  type AgentLauncher,
} from './AgentLauncherContext';
import { AgentProviderEditor } from './AgentProviderEditor';
import { AgentRuntimeHost } from './AgentRuntimeHost';
import { AgentSessionsPanel } from './AgentSessionsPanel';
import { QuickBookNudge } from './QuickBookNudge';
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

const useStyles = createUseSheetStyle(() => ({
  root: {
    flex: 1,
  },
}));

function isConfigError(reason: QuickBookConfigErrorReason): boolean {
  return (
    reason === 'provider-missing' ||
    reason === 'model-missing' ||
    reason === 'model-not-multimodal' ||
    reason === 'api-key-missing'
  );
}

export function AgentRoot({ children }: AgentRootProps) {
  const styles = useStyles();
  const toast = useToast();
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
  const [providerEditorId, setProviderEditorId] = useState<string | null>(null);
  const [quickBookReady, setQuickBookReady] = useState(false);
  const [pendingQuickBook, setPendingQuickBook] =
    useState<PendingQuickBookMessage | null>(null);
  const [pendingShareImage, setPendingShareImage] =
    useState<QuickBookImage | null>(null);
  const startingQuickBookRef = useRef(false);

  const quickBookSettings = useQuickBookSettingsStore();
  const threadId = session.currentThreadId;
  const sessionSending = session.sending;
  const sessionErrorText = session.errorText;
  const ensureQuickBookThread = session.ensureQuickBookThread;
  const threadSelection = useThreadModelStore(state =>
    threadId === null ? undefined : state.selections[String(threadId)],
  );
  const configuredProviderId =
    threadSelection?.providerId ?? activeProviderId;

  const activeProvider =
    providers.find(provider => provider.id === activeProviderId) ??
    providers[0] ??
    null;
  const editingProvider =
    providers.find(provider => provider.id === providerEditorId) ?? null;

  const refreshConfigured = useCallback(async (): Promise<void> => {
    const provider =
      configuredProviderId === null
        ? getActiveAgentProvider()
        : getAgentProvider(configuredProviderId);
    if (provider === null) {
      setConfigured(false);
      return;
    }
    try {
      setConfigured(await hasProviderApiKey(provider.id));
    } catch {
      setConfigured(false);
    }
  }, [configuredProviderId]);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async (): Promise<void> => {
      await Promise.all([
        rehydrateAgentProviders(),
        rehydrateThreadModelSelections(),
        rehydrateQuickBookSettings(),
        rehydrateQuickBookRuntime(),
      ]);
      if (!cancelled) {
        setQuickBookReady(true);
      }
    };
    hydrate().catch(() => {
      if (!cancelled) {
        setQuickBookReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refreshConfigured().catch(() => undefined);
  }, [providers, configuredProviderId, refreshConfigured]);

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

  const handleOpenModelSettings = useCallback(
    (targetProviderId?: string): void => {
      const target = targetProviderId ?? activeProvider?.id ?? null;
      const exists =
        target !== null && providers.some(provider => provider.id === target);
      if (!exists) {
        handleOpenSettings();
        return;
      }
      setProviderEditorId(target);
    },
    [activeProvider, handleOpenSettings, providers],
  );

  const navigateToQuickBookSettings = useCallback((): void => {
    setDrawerOpen(false);
    if (rootNavigationRef.isReady()) {
      rootNavigationRef.navigate(ROOT_ROUTES.QuickBookSettings);
    }
  }, []);

  const showQuickBookError = useCallback(
    (result: QuickBookStartResult): void => {
      if (result.ok) {
        return;
      }
      toast.show({ messageText: result.message, status: 'error' });
      if (isConfigError(result.reason)) {
        navigateToQuickBookSettings();
      }
    },
    [navigateToQuickBookSettings, toast],
  );

  const handleStartQuickBook = useCallback(
    async (
      image: QuickBookImage,
      _source: QuickBookSource,
    ): Promise<QuickBookStartResult> => {
      if (startingQuickBookRef.current) {
        return {
          ok: false,
          reason: 'agent-busy',
          message: '正在准备记账会话，请稍候。',
        };
      }
      if (!book) {
        return { ok: false, reason: 'no-book', message: '请先选择账本。' };
      }
      if (sessionSending) {
        return {
          ok: false,
          reason: 'agent-busy',
          message: '助手正在回复，请稍后再试。',
        };
      }

      startingQuickBookRef.current = true;
      try {
        const settings = getQuickBookSettings();
        const resolution = resolveQuickBookModel(providers, settings);
        if (!resolution.ok) {
          const message =
            resolution.reason === 'provider-missing'
              ? '请先在 AI 记账设置中选择 AI 提供商。'
              : resolution.reason === 'model-missing'
                ? '请先在 AI 记账设置中选择模型。'
                : '所选模型不支持图片输入，请重新选择。';
          return { ok: false, reason: resolution.reason, message };
        }

        let hasKey = false;
        try {
          hasKey = await hasProviderApiKey(resolution.provider.id);
        } catch {
          hasKey = false;
        }
        if (!hasKey) {
          return {
            ok: false,
            reason: 'api-key-missing',
            message: '所选提供商还没有保存 API Key。',
          };
        }

        const filePart = toQuickBookFilePart(image);
        if (filePart === null) {
          return {
            ok: false,
            reason: 'image-unavailable',
            message: '截图读取失败，请重试。',
          };
        }

        const threadIdOrNull = await ensureQuickBookThread(
          buildQuickBookThreadTitle(),
        );
        if (threadIdOrNull === null) {
          return {
            ok: false,
            reason: 'failed',
            message: sessionErrorText || '创建会话失败，请稍后重试。',
          };
        }

        rememberThreadModel(
          threadIdOrNull,
          resolution.provider.id,
          resolution.model.modelId,
        );

        const text =
          settings.presetPrompt.trim() || DEFAULT_QUICK_BOOK_PROMPT;
        setPendingQuickBook({
          id: `${threadIdOrNull}-${Date.now()}`,
          threadId: threadIdOrNull,
          text,
          files: [filePart],
          attachments: [toQuickBookAttachment(image)],
        });
        setDrawerOpen(true);
        return { ok: true };
      } catch {
        return {
          ok: false,
          reason: 'failed',
          message: '启动记账会话失败，请稍后重试。',
        };
      } finally {
        startingQuickBookRef.current = false;
      }
    },
    [
      book,
      ensureQuickBookThread,
      providers,
      sessionErrorText,
      sessionSending,
    ],
  );

  const launcher = useMemo<AgentLauncher>(
    () => ({
      openAgent: handleOpen,
      startQuickBook: handleStartQuickBook,
    }),
    [handleOpen, handleStartQuickBook],
  );

  const isQuickBookConfigured = useMemo(
    () => resolveQuickBookModel(providers, quickBookSettings).ok,
    [providers, quickBookSettings],
  );

  const { nudge, dismiss } = useScreenshotNudge({
    enabled:
      quickBookReady &&
      quickBookSettings.nudgeEnabled &&
      isQuickBookConfigured,
    windowSeconds: quickBookSettings.freshWindowSeconds,
    suppressed: drawerOpen,
  });

  const handleNudgeStart = useCallback((): void => {
    if (!nudge) {
      return;
    }
    const image = nudge.image;
    dismiss();
    handleStartQuickBook(image, 'nudge')
      .then(result => {
        if (!result.ok) {
          showQuickBookError(result);
        }
      })
      .catch(() => undefined);
  }, [dismiss, handleStartQuickBook, nudge, showQuickBookError]);

  const handleShareImage = useCallback(
    (image: QuickBookImage): void => {
      if (!quickBookReady || !book) {
        setPendingShareImage(image);
        return;
      }
      handleStartQuickBook(image, 'share')
        .then(result => {
          if (!result.ok) {
            showQuickBookError(result);
          }
        })
        .catch(() => undefined);
    },
    [book, handleStartQuickBook, quickBookReady, showQuickBookError],
  );

  useQuickBookShare(handleShareImage);

  useEffect(() => {
    if (pendingShareImage === null || !quickBookReady || !book) {
      return;
    }
    const image = pendingShareImage;
    setPendingShareImage(null);
    handleStartQuickBook(image, 'share')
      .then(result => {
        if (!result.ok) {
          showQuickBookError(result);
        }
      })
      .catch(() => undefined);
  }, [
    book,
    handleStartQuickBook,
    pendingShareImage,
    quickBookReady,
    showQuickBookError,
  ]);

  return (
    <AgentLauncherContext.Provider value={launcher}>
      <AgentChatContext.Provider value={session}>
        <Column style={styles.root}>
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
                  onOpenModelSettings={handleOpenModelSettings}
                  onOpenSessions={handleOpenSessions}
                  onOpenSettings={handleOpenSettings}
                  onPendingQuickBookSent={() => setPendingQuickBook(null)}
                  pendingQuickBook={pendingQuickBook}
                  session={session}
                  threadId={threadId}
                />
              )}
              <AgentSessionsPanel
                chat={session}
                onOpenChange={setSessionsOpen}
                open={sessionsOpen}
              />
              {editingProvider ? (
                <AgentProviderEditor
                  descriptorId={editingProvider.descriptorId}
                  initial={editingProvider}
                  onOpenChange={open => {
                    if (!open) {
                      setProviderEditorId(null);
                    }
                  }}
                  onSaved={() => undefined}
                  open={providerEditorId !== null}
                />
              ) : null}
            </AgentErrorBoundary>
          ) : null}
          <QuickBookNudge
            image={nudge?.image ?? null}
            onDismiss={dismiss}
            onStart={handleNudgeStart}
          />
        </Column>
      </AgentChatContext.Provider>
    </AgentLauncherContext.Provider>
  );
}
