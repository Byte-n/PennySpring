import { useCallback, useEffect, useRef, useState } from 'react';
import type { UIMessage } from 'ai';
import type {
  AgentSelection,
  AgentThreadDetail,
  AgentThreadRow,
  BookRow,
} from '@pennyspring/api';

import { useGlobalApi } from '../../stores/bookStore';
import {
  addUsage,
  EMPTY_USAGE,
  sumUsage,
} from '../core/messages';
import type { TokenUsage } from '../core/types';
import { rowsToUiMessages } from '../core/uiMessages';
import { TITLE_MAX_LENGTH } from './copy';
import { getErrorMessage } from './errorMessage';

export interface AgentSessionState {
  loading: boolean;
  sending: boolean;
  errorText: string;
  usage: TokenUsage;
  threads: AgentThreadRow[];
  threadsLoading: boolean;
  currentThreadId: number | null;
  currentThread: AgentThreadRow | null;
  sessionVersion: number;
  initialMessages: UIMessage[];
  createThread: () => Promise<boolean>;
  ensureThread: () => Promise<number | null>;
  syncDraftSelection: (selection: AgentSelection) => void;
  ensureQuickBookThread: (
    title: string,
    selection: AgentSelection,
  ) => Promise<number | null>;
  selectThread: (threadId: number) => Promise<boolean>;
  deleteThread: (threadId: number) => Promise<void>;
  deleteCurrentThread: () => Promise<void>;
  refreshThreads: () => Promise<void>;
  ensureTitle: (text: string) => Promise<void>;
  updateThreadModel: (selection: AgentSelection) => Promise<void>;
  markActivity: () => void;
  accumulateUsage: (usage: TokenUsage) => void;
  setSending: (sending: boolean) => void;
  setErrorText: (text: string) => void;
}

interface UseAgentSessionOptions {
  book: BookRow | null;
  enabled: boolean;
  getDefaultSelection: () => Promise<AgentSelection>;
}

export function useAgentSession({
  book,
  enabled,
  getDefaultSelection,
}: UseAgentSessionOptions): AgentSessionState {
  const api = useGlobalApi();
  const bookId = book?.id;

  const [loading, setLoading] = useState(false);
  const [sending, setSendingState] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [usage, setUsage] = useState<TokenUsage>(EMPTY_USAGE);
  const [threads, setThreads] = useState<AgentThreadRow[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);
  const [currentThread, setCurrentThread] = useState<AgentThreadRow | null>(null);
  const [sessionVersion, setSessionVersion] = useState(0);
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);

  const threadIdRef = useRef<number | null>(null);
  const titleRef = useRef('');
  const hasMessagesRef = useRef(false);
  const sendingRef = useRef(false);
  const creatingThreadRef = useRef<Promise<number | null> | null>(null);
  const bookIdRef = useRef(bookId);
  bookIdRef.current = bookId;
  const loadSeqRef = useRef(0);

  const setSending = useCallback((next: boolean): void => {
    sendingRef.current = next;
    setSendingState(next);
  }, []);

  const resetConversation = useCallback((): void => {
    threadIdRef.current = null;
    titleRef.current = '';
    hasMessagesRef.current = false;
    setCurrentThreadId(null);
    setCurrentThread(null);
    setInitialMessages([]);
    setUsage(EMPTY_USAGE);
  }, []);

  const setDraftConversation = useCallback(
    (selection: AgentSelection): void => {
      const now = Date.now();
      const draft: AgentThreadRow = {
        id: 0,
        booksId: bookId ?? 0,
        title: '',
        providerId: selection.providerId,
        modelId: selection.modelId,
        createdTime: now,
        updatedTime: now,
      };
      threadIdRef.current = 0;
      titleRef.current = '';
      hasMessagesRef.current = false;
      setCurrentThreadId(0);
      setCurrentThread(draft);
      setInitialMessages([]);
      setUsage(EMPTY_USAGE);
    },
    [bookId],
  );

  const syncDraftSelection = useCallback(
    (selection: AgentSelection): void => {
      if (threadIdRef.current === 0) {
        setDraftConversation(selection);
      }
    },
    [setDraftConversation],
  );

  const applyDetail = useCallback((detail: AgentThreadDetail): void => {
    const messages = rowsToUiMessages(detail.messages);
    threadIdRef.current = detail.thread.id;
    titleRef.current = detail.thread.title;
    hasMessagesRef.current = messages.length > 0;
    setCurrentThreadId(detail.thread.id);
    setCurrentThread(detail.thread);
    setInitialMessages(messages);
    setUsage(sumUsage(detail.messages));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const seq = ++loadSeqRef.current;

    resetConversation();
    setThreads([]);
    setErrorText('');
    setSending(false);

    if (!enabled || bookId === undefined) {
      setLoading(false);
      setThreadsLoading(false);
      return;
    }

    setLoading(true);
    setThreadsLoading(true);

    const load = async (): Promise<void> => {
      try {
        const selection = await getDefaultSelection();
        let detail = await api.agent.getLatestThreadWithMessages(
          bookId,
          selection,
        );
        if (cancelled || seq !== loadSeqRef.current) {
          return;
        }

        if (detail && detail.thread.providerId === 0 && selection.providerId > 0) {
          const thread = await api.agent.updateThreadModel(
            detail.thread.id,
            selection,
          );
          detail = { ...detail, thread };
        }

        if (
          detail === null ||
          (detail.thread.title === '' && detail.messages.length === 0)
        ) {
          setDraftConversation(selection);
        } else {
          applyDetail(detail);
        }

        const list = await api.agent.listThreads(bookId);
        if (!cancelled && seq === loadSeqRef.current) {
          setThreads(list);
        }
      } catch (error) {
        if (!cancelled && seq === loadSeqRef.current) {
          setErrorText(getErrorMessage(error));
        }
      } finally {
        if (!cancelled && seq === loadSeqRef.current) {
          setLoading(false);
          setThreadsLoading(false);
        }
      }
    };

    load().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    api,
    applyDetail,
    bookId,
    enabled,
    getDefaultSelection,
    resetConversation,
    setDraftConversation,
    setSending,
  ]);

  const refreshThreads = useCallback(async (): Promise<void> => {
    if (bookId === undefined) {
      return;
    }
    setThreadsLoading(true);
    try {
      const list = await api.agent.listThreads(bookId);
      if (bookIdRef.current === bookId) {
        setThreads(list);
      }
    } catch (error) {
      if (bookIdRef.current === bookId) {
        setErrorText(getErrorMessage(error));
      }
    } finally {
      if (bookIdRef.current === bookId) {
        setThreadsLoading(false);
      }
    }
  }, [api, bookId]);

  const ensureTitle = useCallback(
    async (text: string): Promise<void> => {
      const threadId = threadIdRef.current;
      const title = text.trim().slice(0, TITLE_MAX_LENGTH);
      if (threadId === null || titleRef.current || !title) {
        return;
      }

      await api.agent.updateThreadTitle(threadId, title);
      titleRef.current = title;
      setThreads(previous =>
        previous.map(item =>
          item.id === threadId ? { ...item, title } : item,
        ),
      );
    },
    [api],
  );

  const markActivity = useCallback((): void => {
    hasMessagesRef.current = true;
  }, []);

  const accumulateUsage = useCallback((delta: TokenUsage): void => {
    setUsage(previous => addUsage(previous, delta));
  }, []);

  const createThread = useCallback(async (): Promise<boolean> => {
    if (!book || sendingRef.current) {
      return false;
    }
    try {
      const selection = await getDefaultSelection();
      resetConversation();
      setDraftConversation(selection);
      setSessionVersion(previous => previous + 1);
      return true;
    } catch (error: unknown) {
      setErrorText(getErrorMessage(error));
      return false;
    }
  }, [book, getDefaultSelection, resetConversation, setDraftConversation]);

  const ensureThread = useCallback(async (): Promise<number | null> => {
    const currentId = threadIdRef.current;
    if (currentId !== null && currentId > 0) {
      return currentId;
    }
    if (!book || sendingRef.current) {
      return null;
    }
    if (creatingThreadRef.current) {
      return creatingThreadRef.current;
    }

    const creation = (async (): Promise<number | null> => {
      try {
        const selection = await getDefaultSelection();
        if (selection.providerId <= 0) {
          return null;
        }
        const thread = await api.agent.createThread(
          book.id,
          selection,
        );
        threadIdRef.current = thread.id;
        titleRef.current = thread.title;
        hasMessagesRef.current = false;
        setCurrentThreadId(thread.id);
        setCurrentThread(thread);
        setInitialMessages([]);
        setUsage(EMPTY_USAGE);
        setThreads(previous => [thread, ...previous]);
        return thread.id;
      } catch (error: unknown) {
        setErrorText(getErrorMessage(error));
        return null;
      } finally {
        creatingThreadRef.current = null;
      }
    })();
    creatingThreadRef.current = creation;
    return creation;
  }, [api, book, getDefaultSelection]);

  const ensureQuickBookThread = useCallback(
    async (
      title: string,
      selection: AgentSelection,
    ): Promise<number | null> => {
      if (!book || sendingRef.current) {
        return null;
      }

      setLoading(true);
      setErrorText('');
      try {
        const isReusableBlank =
          threadIdRef.current !== null &&
          threadIdRef.current > 0 &&
          !hasMessagesRef.current &&
          !titleRef.current;
        let threadId = threadIdRef.current;

        if (!isReusableBlank) {
          const thread = await api.agent.createThread(book.id, selection);
          threadId = thread.id;
          threadIdRef.current = thread.id;
          hasMessagesRef.current = false;
          setCurrentThreadId(thread.id);
          setCurrentThread(thread);
          setInitialMessages([]);
          setUsage(EMPTY_USAGE);
          setThreads(previous => [thread, ...previous]);
        } else if (threadId !== null) {
          const updated = await api.agent.updateThreadModel(
            threadId,
            selection,
          );
          setCurrentThread(updated);
          setThreads(previous =>
            previous.map(item => (item.id === threadId ? updated : item)),
          );
        }

        if (threadId === null) {
          return null;
        }

        const nextTitle = title.trim();
        if (nextTitle) {
          await api.agent.updateThreadTitle(threadId, nextTitle);
          titleRef.current = nextTitle;
          setThreads(previous =>
            previous.map(item =>
              item.id === threadId ? { ...item, title: nextTitle } : item,
            ),
          );
        }
        return threadId;
      } catch (error) {
        setErrorText(getErrorMessage(error));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api, book],
  );

  const selectThread = useCallback(
    async (threadId: number): Promise<boolean> => {
      if (sendingRef.current) {
        return false;
      }
      if (threadId === threadIdRef.current) {
        return true;
      }

      const seq = ++loadSeqRef.current;
      setLoading(true);
      setErrorText('');

      try {
        const detail = await api.agent.getThreadDetail(threadId);
        if (seq !== loadSeqRef.current) {
          return false;
        }
        applyDetail(detail);
        setSessionVersion(previous => previous + 1);
        return true;
      } catch (error) {
        if (seq === loadSeqRef.current) {
          setErrorText(getErrorMessage(error));
        }
        return false;
      } finally {
        if (seq === loadSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [api, applyDetail],
  );

  const deleteThread = useCallback(
    async (threadId: number): Promise<void> => {
      if (!book) {
        return;
      }
      if (sendingRef.current) {
        throw new Error('请先停止当前回答再删除会话。');
      }

      setThreadsLoading(true);
      try {
        await api.agent.deleteThread(threadId);

        if (threadIdRef.current === threadId) {
          resetConversation();
          setDraftConversation(await getDefaultSelection());
          setSessionVersion(previous => previous + 1);
          setThreads(previous => previous.filter(item => item.id !== threadId));
        } else {
          setThreads(previous =>
            previous.filter(item => item.id !== threadId),
          );
        }
      } catch (error) {
        setErrorText(getErrorMessage(error));
        throw error;
      } finally {
        setThreadsLoading(false);
      }
    },
    [api, book, getDefaultSelection, resetConversation, setDraftConversation],
  );

  const deleteCurrentThread = useCallback(async (): Promise<void> => {
    const threadId = threadIdRef.current;
    if (threadId === null || threadId <= 0) {
      return;
    }
    await deleteThread(threadId);
  }, [deleteThread]);

  const updateThreadModel = useCallback(
    async (selection: AgentSelection): Promise<void> => {
      const threadId = threadIdRef.current;
      if (threadId === null) {
        return;
      }
      const updated = await api.agent.updateThreadModel(threadId, selection);
      setCurrentThread(updated);
      setThreads(previous =>
        previous.map(item => (item.id === updated.id ? updated : item)),
      );
    },
    [api],
  );

  return {
    loading,
    sending,
    errorText,
    usage,
    threads,
    threadsLoading,
    currentThreadId,
    currentThread,
    sessionVersion,
    initialMessages,
    createThread,
    ensureThread,
    syncDraftSelection,
    ensureQuickBookThread,
    selectThread,
    deleteThread,
    deleteCurrentThread,
    refreshThreads,
    ensureTitle,
    updateThreadModel,
    markActivity,
    accumulateUsage,
    setSending,
    setErrorText,
  };
}
