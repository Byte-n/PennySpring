import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';

import type { AgentThreadRow, BookRow } from '@pennyspring/api';

import { getAgentConfig } from '../adapters/configStore';
import { loadApiKey } from '../adapters/secureKey';
import { createXhrStreamTransport } from '../adapters/streamTransport';
import { DEFAULT_MAX_STEPS, runAgent } from '../core/loop/runAgent';
import { isAgentError } from '../core/protocol/errors';
import type { ChatMessage, TokenUsage } from '../core/types';
import { isValidBaseUrl } from '../core/url';
import { buildSystemPrompt } from '../projection/context';
import {
  createQueryRecordsTool,
  QUERY_RECORDS_TOOL,
} from '../tools/queryRecords';
import { useGlobalApi } from '../../stores/bookStore';
import { sumUsage, toChatMessages, toPersistedInputs } from './chatModel';

export const AGENT_NOT_CONFIGURED_MESSAGE =
  '尚未配置助手，请先打开设置填写 Base URL、模型名称和 API Key。';

const EMPTY_REPLY_MESSAGE = '助手没有返回内容，请换个问法再试。';
const PARTIAL_SAVE_FAILED_MESSAGE = '回答已生成，但保存到本地失败。';
const TITLE_MAX_LENGTH = 30;

interface UseAgentChatOptions {
  book: BookRow | null;
  enabled: boolean;
}

export interface AgentChatState {
  loading: boolean;
  sending: boolean;
  messages: ChatMessage[];
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
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return '回答失败，请稍后再试。';
}

function isAbortedError(error: unknown): boolean {
  return isAgentError(error) && error.code === 'aborted';
}

function toolStatusText(name: string): string {
  return name === 'queryRecords' ? '正在查询账本数据…' : '正在调用工具…';
}

export function useAgentChat({
  book,
  enabled,
}: UseAgentChatOptions): AgentChatState {
  const api = useGlobalApi();
  const bookId = book?.id;

  const [messages, setMessagesState] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  const [threads, setThreads] = useState<AgentThreadRow[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<number | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  const threadIdRef = useRef<number | null>(null);
  const titleRef = useRef('');
  const sendingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const streamTextRef = useRef('');
  const loadSeqRef = useRef(0);
  const bookIdRef = useRef(bookId);
  bookIdRef.current = bookId;

  const setMessages = useCallback((next: ChatMessage[]): void => {
    messagesRef.current = next;
    setMessagesState(next);
  }, []);

  const resetStream = useCallback((): void => {
    setStreamingText('');
    setActiveTool(null);
    streamTextRef.current = '';
  }, []);

  useEffect(() => {
    let cancelled = false;
    const seq = ++loadSeqRef.current;

    threadIdRef.current = null;
    titleRef.current = '';
    setCurrentThreadId(null);
    setMessages([]);
    setThreads([]);
    resetStream();
    setErrorText('');

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
        setMessages(toChatMessages(detail.messages));

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
      messagesRef.current.length === 0 &&
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
      setMessages([]);
      resetStream();
      setThreads(previous => [thread, ...previous]);
      return true;
    } catch (error) {
      setErrorText(getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  }, [api, book, resetStream, setMessages]);

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
        setMessages(toChatMessages(detail.messages));
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
          setMessages([]);
          resetStream();

          const created = await api.agent.createThread(book.id);
          threadIdRef.current = created.id;
          titleRef.current = created.title;
          setCurrentThreadId(created.id);
          setThreads(previous => [created, ...previous.filter(item => item.id !== threadId)]);
        }
      } catch (error) {
        setErrorText(getErrorMessage(error));
        throw error;
      } finally {
        setThreadsLoading(false);
      }
    },
    [api, book, resetStream, setMessages],
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

      const config = getAgentConfig();
      if (!config.baseUrl || !config.model) {
        setErrorText(AGENT_NOT_CONFIGURED_MESSAGE);
        return;
      }
      if (!isValidBaseUrl(config.baseUrl)) {
        setErrorText('Base URL 格式不正确，应形如 https://host/v1。');
        return;
      }

      let apiKey: string | null;
      try {
        apiKey = await loadApiKey();
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

      const userMessage: ChatMessage = { role: 'user', content: text };
      const history = [...messagesRef.current, userMessage];
      setMessages(history);

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
        const systemMessage: ChatMessage = {
          role: 'system',
          content: buildSystemPrompt({
            bookName: book.name,
            today: dayjs().format('YYYY-MM-DD'),
            types,
          }),
        };

        const result = await runAgent({
          transport: createXhrStreamTransport({
            baseUrl: config.baseUrl,
            apiKey,
            model: config.model,
          }),
          executeTool: createQueryRecordsTool({
            api,
            booksId: book.id,
            bookName: book.name,
          }),
          messages: [systemMessage, ...history],
          tools: [QUERY_RECORDS_TOOL],
          maxSteps: DEFAULT_MAX_STEPS,
          signal: controller.signal,
          onText: delta => {
            streamTextRef.current += delta;
            setStreamingText(streamTextRef.current);
          },
          onToolCall: call => {
            setActiveTool(toolStatusText(call.name));
          },
        });

        const finalMessages = [...history, ...result.messages];
        setMessages(finalMessages);
        setStreamingText('');
        streamTextRef.current = '';

        if (result.messages.length === 0) {
          setErrorText(EMPTY_REPLY_MESSAGE);
          return;
        }

        try {
          await api.agent.appendMessages(
            threadId,
            toPersistedInputs(result.messages),
          );
        } catch {
          setErrorText(PARTIAL_SAVE_FAILED_MESSAGE);
        }
      } catch (error) {
        const partial = streamTextRef.current;
        setStreamingText('');
        streamTextRef.current = '';

        if (partial) {
          const partialMessage: ChatMessage = {
            role: 'assistant',
            content: partial,
          };
          setMessages([...messagesRef.current, partialMessage]);
          if (threadId !== null) {
            await api.agent
              .appendMessages(threadId, toPersistedInputs([partialMessage]))
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

  const usage = useMemo(() => sumUsage(messages), [messages]);

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
