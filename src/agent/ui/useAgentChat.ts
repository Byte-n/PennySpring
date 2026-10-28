import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { APICallError, type ModelMessage } from 'ai';

import type { AgentThreadRow, BookRow } from '@pennyspring/api';

import { getActiveAgentProvider } from '../providers/configStore';
import { loadProviderApiKey } from '../providers/secureKey';
import { runAgent } from '../core/runAgent';
import {
  createAssistantModelMessage,
  createUserModelMessage,
  rowsToModelMessages,
  sumUsage,
  toDisplayMessages,
  toPersistedInputs,
} from '../core/messages';
import {
  isAgentError,
  toHttpError,
} from '../core/protocol/errors';
import type {
  AgentDisplayMessage,
  TokenUsage,
} from '../core/types';
import { buildSystemPrompt } from '../projection/context';
import { createQueryRecordsTool } from '../tools/queryRecords';
import { useGlobalApi } from '../../stores/bookStore';

export const AGENT_NOT_CONFIGURED_MESSAGE =
  '尚未配置助手，请先打开设置添加 AI 提供商。';

const EMPTY_REPLY_MESSAGE = '助手没有返回内容，请换个问法再试。';
const PARTIAL_SAVE_FAILED_MESSAGE = '回答已生成，但保存到本地失败。';
const TITLE_MAX_LENGTH = 30;

const EMPTY_USAGE: TokenUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
};

interface UseAgentChatOptions {
  book: BookRow | null;
  enabled: boolean;
}

export interface AgentChatState {
  loading: boolean;
  sending: boolean;
  messages: AgentDisplayMessage[];
  streamingText: string;
  activeTool: string | null;
  errorText: string;
  usage: TokenUsage;
  threads: AgentThreadRow[];
  threadsLoading: boolean;
  currentThreadId: number | null;
  send: (text: string) => Promise<void>;
  stop: () => void;
  createThread: () => Promise<boolean>;
  selectThread: (threadId: number) => Promise<boolean>;
  deleteThread: (threadId: number) => Promise<void>;
  deleteCurrentThread: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (isAgentError(error)) {
    return error.message;
  }
  if (APICallError.isInstance(error) && error.statusCode) {
    return toHttpError(error.statusCode, error.responseBody ?? '').message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '回答失败，请稍后再试。';
}

function isAbortedError(error: unknown): boolean {
  if (isAgentError(error) && error.code === 'aborted') {
    return true;
  }
  return error instanceof Error && error.name === 'AbortError';
}

function toolStatusText(name: string): string {
  return name === 'queryRecords' ? '正在查询账本数据…' : '正在调用工具…';
}

function addUsage(total: TokenUsage, delta: TokenUsage): TokenUsage {
  return {
    promptTokens: total.promptTokens + delta.promptTokens,
    completionTokens: total.completionTokens + delta.completionTokens,
    totalTokens: total.totalTokens + delta.totalTokens,
  };
}

export function useAgentChat({
  book,
  enabled,
}: UseAgentChatOptions): AgentChatState {
  const api = useGlobalApi();
  const bookId = book?.id;

  const [messages, setMessagesState] = useState<AgentDisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [usage, setUsage] = useState<TokenUsage>(EMPTY_USAGE);
  const [threads, setThreads] = useState<AgentThreadRow[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);

  const messagesRef = useRef<AgentDisplayMessage[]>([]);
  const modelMessagesRef = useRef<ModelMessage[]>([]);
  const threadIdRef = useRef<number | null>(null);
  const titleRef = useRef('');
  const sendingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const streamTextRef = useRef('');
  const loadSeqRef = useRef(0);
  const bookIdRef = useRef(bookId);
  bookIdRef.current = bookId;

  const setMessages = useCallback((next: AgentDisplayMessage[]): void => {
    messagesRef.current = next;
    setMessagesState(next);
  }, []);

  const resetStream = useCallback((): void => {
    setStreamingText('');
    setActiveTool(null);
    streamTextRef.current = '';
  }, []);

  const resetConversation = useCallback((): void => {
    modelMessagesRef.current = [];
    setMessages([]);
    resetStream();
    setUsage(EMPTY_USAGE);
  }, [resetStream, setMessages]);

  useEffect(() => {
    let cancelled = false;
    const seq = ++loadSeqRef.current;

    threadIdRef.current = null;
    titleRef.current = '';
    setCurrentThreadId(null);
    setMessages([]);
    modelMessagesRef.current = [];
    setThreads([]);
    resetStream();
    setErrorText('');
    setUsage(EMPTY_USAGE);

    if (!enabled || bookId === undefined) {
      setLoading(false);
      setThreadsLoading(false);
      return;
    }

    setLoading(true);
    setThreadsLoading(true);
    api.agent
      .getLatestThreadWithMessages(bookId)
      .then(async detail => {
        if (cancelled || seq !== loadSeqRef.current) {
          return;
        }
        threadIdRef.current = detail.thread.id;
        titleRef.current = detail.thread.title;
        setCurrentThreadId(detail.thread.id);

        const modelMessages = rowsToModelMessages(detail.messages);
        modelMessagesRef.current = modelMessages;
        setMessages(toDisplayMessages(modelMessages));
        setUsage(sumUsage(detail.messages));

        const list = await api.agent.listThreads(bookId);
        if (!cancelled && seq === loadSeqRef.current) {
          setThreads(list);
        }
      })
      .catch(error => {
        if (!cancelled && seq === loadSeqRef.current) {
          setErrorText(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!cancelled && seq === loadSeqRef.current) {
          setLoading(false);
          setThreadsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controllerRef.current?.abort();
    };
  }, [api, bookId, enabled, resetStream, setMessages]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

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

  const createThread = useCallback(async (): Promise<boolean> => {
    if (!book || sendingRef.current) {
      return false;
    }
    const isCurrentBlank =
      threadIdRef.current !== null &&
      modelMessagesRef.current.length === 0 &&
      !titleRef.current;
    if (isCurrentBlank) {
      return false;
    }

    setLoading(true);
    setErrorText('');
    try {
      const thread = await api.agent.createThread(book.id);
      threadIdRef.current = thread.id;
      titleRef.current = thread.title;
      setCurrentThreadId(thread.id);
      resetConversation();
      setThreads(previous => [thread, ...previous]);
      return true;
    } catch (error) {
      setErrorText(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, [api, book, resetConversation]);

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
      resetStream();
      try {
        const detail = await api.agent.getThreadDetail(threadId);
        if (seq !== loadSeqRef.current) {
          return false;
        }
        threadIdRef.current = detail.thread.id;
        titleRef.current = detail.thread.title;
        setCurrentThreadId(detail.thread.id);

        const modelMessages = rowsToModelMessages(detail.messages);
        modelMessagesRef.current = modelMessages;
        setMessages(toDisplayMessages(modelMessages));
        setUsage(sumUsage(detail.messages));
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
    [api, resetStream, setMessages],
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
        setThreads(previous => previous.filter(item => item.id !== threadId));
        if (threadIdRef.current === threadId) {
          threadIdRef.current = null;
          titleRef.current = '';
          setCurrentThreadId(null);
          resetConversation();

          const created = await api.agent.createThread(book.id);
          threadIdRef.current = created.id;
          titleRef.current = created.title;
          setCurrentThreadId(created.id);
          setThreads(previous => [
            created,
            ...previous.filter(item => item.id !== threadId),
          ]);
        }
      } catch (error) {
        setErrorText(getErrorMessage(error));
        throw error;
      } finally {
        setThreadsLoading(false);
      }
    },
    [api, book, resetConversation],
  );

  const deleteCurrentThread = useCallback(async (): Promise<void> => {
    const threadId = threadIdRef.current;
    if (threadId === null) {
      return;
    }
    await deleteThread(threadId);
  }, [deleteThread]);

  const send = useCallback(
    async (rawText: string): Promise<void> => {
      const text = rawText.trim();
      if (!text || sendingRef.current || !book || !enabled) {
        return;
      }

      const provider = getActiveAgentProvider();
      if (provider === null) {
        setErrorText(AGENT_NOT_CONFIGURED_MESSAGE);
        return;
      }

      let apiKey: string | null;
      try {
        apiKey = await loadProviderApiKey(provider.id);
      } catch (error) {
        setErrorText(getErrorMessage(error));
        return;
      }
      if (!apiKey) {
        setErrorText(AGENT_NOT_CONFIGURED_MESSAGE);
        return;
      }
      if (sendingRef.current) {
        return;
      }

      sendingRef.current = true;
      setSending(true);
      setErrorText('');
      setActiveTool(null);
      setStreamingText('');
      streamTextRef.current = '';

      const userMessage = createUserModelMessage(text);
      const history = [...modelMessagesRef.current, userMessage];
      modelMessagesRef.current = history;
      setMessages([
        ...messagesRef.current,
        { role: 'user', content: text, hasToolCalls: false },
      ]);

      const controller = new AbortController();
      controllerRef.current = controller;
      let threadId = threadIdRef.current;

      try {
        if (threadId === null) {
          const thread = await api.agent.createThread(book.id);
          threadId = thread.id;
          threadIdRef.current = thread.id;
          setCurrentThreadId(thread.id);
        }

        await api.agent.appendMessages(
          threadId,
          toPersistedInputs([userMessage]),
        );

        if (!titleRef.current) {
          const title = text.slice(0, TITLE_MAX_LENGTH);
          await api.agent.updateThreadTitle(threadId, title);
          titleRef.current = title;
        }

        const types = await api.type.getAll(book.id);
        const systemPrompt = buildSystemPrompt({
          bookName: book.name,
          today: dayjs().format('YYYY-MM-DD'),
          types,
        });
        const tools = {
          queryRecords: createQueryRecordsTool({
            api,
            booksId: book.id,
            bookName: book.name,
          }),
        };

        const result = await runAgent({
          provider,
          apiKey,
          messages: history,
          systemPrompt,
          tools,
          signal: controller.signal,
          onText: delta => {
            streamTextRef.current += delta;
            setStreamingText(streamTextRef.current);
          },
          onToolStart: name => {
            setActiveTool(toolStatusText(name));
          },
          onToolEnd: () => {
            setActiveTool(null);
          },
        });

        const finalMessages = [...history, ...result.messages];
        modelMessagesRef.current = finalMessages;
        setMessages([
          ...messagesRef.current,
          ...toDisplayMessages(result.messages),
        ]);
        setStreamingText('');
        streamTextRef.current = '';
        setUsage(previous => addUsage(previous, result.usage));

        if (result.messages.length === 0) {
          setErrorText(EMPTY_REPLY_MESSAGE);
          return;
        }

        try {
          await api.agent.appendMessages(
            threadId,
            toPersistedInputs(result.messages, result.usage),
          );
        } catch {
          setErrorText(PARTIAL_SAVE_FAILED_MESSAGE);
        }
      } catch (error) {
        const partial = streamTextRef.current;
        setStreamingText('');
        streamTextRef.current = '';

        if (partial) {
          const partialMessage = createAssistantModelMessage(partial);
          modelMessagesRef.current = [
            ...modelMessagesRef.current,
            partialMessage,
          ];
          setMessages([
            ...messagesRef.current,
            {
              role: 'assistant',
              content: partial,
              hasToolCalls: false,
            },
          ]);
          if (threadId !== null) {
            await api.agent
              .appendMessages(
                threadId,
                toPersistedInputs([partialMessage]),
              )
              .catch(() => undefined);
          }
        }

        if (!isAbortedError(error)) {
          setErrorText(getErrorMessage(error));
        }
      } finally {
        sendingRef.current = false;
        setSending(false);
        setActiveTool(null);
        controllerRef.current = null;
        refreshThreads().catch(() => undefined);
      }
    },
    [api, book, enabled, refreshThreads, setMessages],
  );

  const stop = useCallback((): void => {
    controllerRef.current?.abort();
  }, []);

  return {
    loading,
    sending,
    messages,
    streamingText,
    activeTool,
    errorText,
    usage,
    threads,
    threadsLoading,
    currentThreadId,
    send,
    stop,
    createThread,
    selectThread,
    deleteThread,
    deleteCurrentThread,
  };
}
