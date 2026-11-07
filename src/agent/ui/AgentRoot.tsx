import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Linking } from 'react-native';
import { Column, useToast } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

import { DEFAULT_QUICK_BOOK_PROMPT } from '../../features/quickBook/constants';
import { toQuickBookImagePickerValue } from '../../features/quickBook/imagePayload';
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
  QuickBookStartResult,
} from '../../features/quickBook/types';
import { useScreenshotNudge } from '../../features/quickBook/useScreenshotNudge';
import { resolveQuickBookModel } from '../../features/quickBook/validation';
import { useFloatingBallLifecycle } from '../../features/quickBookDraft/useFloatingBallLifecycle';
import { ROOT_ROUTES, rootNavigationRef } from '../../navigation';
import { isAgentDeepLinkUrl } from '../../navigation/linking';
import { useBookStore, useGlobalApi } from '../../stores/bookStore';
import { useMediaStore } from '../../media';
import {
  EMPTY_AGENT_SELECTION,
  useProviderKeyStatus,
  useProviderSelection,
  useProviders,
  useQuickBookSelection,
} from '../providers/useProviders';
import { AgentChatContext } from './AgentChatContext';
import { AgentDrawerFallback } from './AgentDrawerFallback';
import {
  AgentLauncherContext,
  type AgentLauncher,
} from './AgentLauncherContext';
import { AgentProviderEditor } from './AgentProviderEditor';
import { AgentRuntimeHost } from './AgentRuntimeHost';
import { AgentSessionsPanel } from './AgentSessionsPanel';
import { getErrorMessage } from './errorMessage';
import { prepareImageMessage } from './imageAttachments';
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
  const api = useGlobalApi();
  const media = useMediaStore();
  const getDefaultSelection = useCallback(
    () => api.provider.getSelection(),
    [api],
  );

  const session = useAgentSession({
    book,
    enabled: Boolean(book),
    getDefaultSelection,
  });

  const { data: providers = [] } = useProviders();
  const { data: agentSelection = EMPTY_AGENT_SELECTION } =
    useProviderSelection();
  const { data: quickBookSelection = EMPTY_AGENT_SELECTION } =
    useQuickBookSelection();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [providerEditorId, setProviderEditorId] = useState<number | null>(null);
  const [quickBookReady, setQuickBookReady] = useState(false);
  const [pendingQuickBook, setPendingQuickBook] =
    useState<PendingQuickBookMessage | null>(null);
  const startingQuickBookRef = useRef(false);

  const quickBookSettings = useQuickBookSettingsStore();

  useFloatingBallLifecycle({
    book,
    quickBookReady,
    floatingBallEnabled: quickBookSettings.floatingBallEnabled,
    excludedPackages: quickBookSettings.excludedPackages,
    setFloatingBallEnabled: quickBookSettings.setFloatingBallEnabled,
  });

  useEffect(() => {
    const openAgentFromUrl = (url: string | null): void => {
      if (url !== null && isAgentDeepLinkUrl(url)) {
        setDrawerOpen(true);
      }
    };
    try {
      Linking.getInitialURL()
        .then(openAgentFromUrl)
        .catch(() => undefined);
    } catch {
      // 部分运行环境没有 Linking 原生实现，忽略冷启动深链。
    }
    let subscription: ReturnType<typeof Linking.addEventListener> | null = null;
    try {
      subscription = Linking.addEventListener('url', event => {
        openAgentFromUrl(event.url);
      });
    } catch {
      // 没有原生 Linking 时无法接收运行中深链。
    }
    return () => {
      subscription?.remove();
    };
  }, []);

  const threadId = session.currentThreadId;
  const currentThread = session.currentThread;
  const sessionSending = session.sending;
  const sessionErrorText = session.errorText;
  const ensureQuickBookThread = session.ensureQuickBookThread;
  const syncDraftSelection = session.syncDraftSelection;

  const { data: configured = false, refresh: refreshConfigured } =
    useProviderKeyStatus(
      book?.id ?? null,
      currentThread?.providerId ?? agentSelection.providerId,
    );

  const editingProvider =
    providers.find(provider => provider.id === providerEditorId) ?? null;

  useEffect(() => {
    let cancelled = false;
    const hydrate = async (): Promise<void> => {
      await Promise.all([
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
    if (drawerOpen) {
      refreshConfigured();
    }
  }, [drawerOpen, refreshConfigured]);

  useEffect(() => {
    syncDraftSelection(agentSelection);
  }, [agentSelection, syncDraftSelection]);

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
    (targetProviderId?: number): void => {
      const target = targetProviderId ?? currentThread?.providerId ?? 0;
      const exists = providers.some(provider => provider.id === target);
      if (!exists) {
        handleOpenSettings();
        return;
      }
      setProviderEditorId(target);
    },
    [currentThread?.providerId, handleOpenSettings, providers],
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
    async (image: QuickBookImage): Promise<QuickBookStartResult> => {
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

      if (!media) {
        return { ok: false, reason: 'failed', message: '未找到当前账本。' };
      }

      startingQuickBookRef.current = true;
      try {
        const settings = getQuickBookSettings();
        const [providerList, selection] = await Promise.all([
          api.provider.getAll(),
          api.quickBook.getSelection(),
        ]);
        const resolution = resolveQuickBookModel(providerList, selection);
        if (!resolution.ok) {
          const message =
            resolution.reason === 'provider-missing'
              ? '请先在 AI 记账设置中选择 AI 提供商。'
              : resolution.reason === 'model-missing'
                ? '请先在 AI 记账设置中选择模型。'
                : '所选模型不支持图片输入，请重新选择。';
          return { ok: false, reason: resolution.reason, message };
        }

        const hasKey = await api.credential.hasKey(
          book.id,
          resolution.provider.id,
        );
        if (!hasKey) {
          return {
            ok: false,
            reason: 'api-key-missing',
            message: '所选提供商还没有保存 API Key。',
          };
        }

        let prepared;
        try {
          prepared = await prepareImageMessage(
            [toQuickBookImagePickerValue(image)],
            media,
          );
        } catch (error: unknown) {
          return {
            ok: false,
            reason: 'image-unavailable',
            message: getErrorMessage(error),
          };
        }

        const threadIdOrNull = await ensureQuickBookThread(
          buildQuickBookThreadTitle(),
          selection,
        );
        if (threadIdOrNull === null) {
          return {
            ok: false,
            reason: 'failed',
            message: sessionErrorText || '创建会话失败，请稍后重试。',
          };
        }

        const text = settings.presetPrompt.trim() || DEFAULT_QUICK_BOOK_PROMPT;
        setPendingQuickBook({
          id: `${threadIdOrNull}-${Date.now()}`,
          threadId: threadIdOrNull,
          text,
          files: prepared.files,
          attachments: prepared.attachments,
          autoApproveCreate: settings.autoApproveScreenshot,
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
    [api, book, ensureQuickBookThread, media, sessionErrorText, sessionSending],
  );

  const launcher = useMemo<AgentLauncher>(
    () => ({
      openAgent: handleOpen,
      startQuickBook: handleStartQuickBook,
    }),
    [handleOpen, handleStartQuickBook],
  );

  const isQuickBookConfigured = useMemo(
    () => resolveQuickBookModel(providers, quickBookSelection).ok,
    [providers, quickBookSelection],
  );

  const { nudge, dismiss } = useScreenshotNudge({
    enabled:
      quickBookReady && quickBookSettings.nudgeEnabled && isQuickBookConfigured,
    windowSeconds: quickBookSettings.freshWindowSeconds,
    suppressed: drawerOpen,
  });

  const handleNudgeStart = useCallback((): void => {
    if (!nudge) {
      return;
    }
    const image = nudge.image;
    dismiss();
    handleStartQuickBook(image)
      .then(result => {
        if (!result.ok) {
          showQuickBookError(result);
        }
      })
      .catch(() => undefined);
  }, [dismiss, handleStartQuickBook, nudge, showQuickBookError]);

  return (
    <AgentLauncherContext.Provider value={launcher}>
      <AgentChatContext.Provider value={session}>
        <Column style={styles.root}>
          {children}
          {book ? (
            <AgentErrorBoundary>
              {session.loading ? (
                <AgentDrawerFallback
                  errorText={session.errorText}
                  onOpenChange={setDrawerOpen}
                  onOpenSessions={handleOpenSessions}
                  onOpenSettings={handleOpenSettings}
                  open={drawerOpen}
                />
              ) : (
                <AgentRuntimeHost
                  key={`${book.id}:${session.sessionVersion}`}
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
