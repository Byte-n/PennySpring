import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIMessage,
} from 'ai';
import { useChatRuntime } from '@assistant-ui/ai-sdk';
import { useAuiState, type AssistantRuntime } from '@assistant-ui/react-native';
import type { BookRow } from '@pennyspring/api';

import { useMediaStore } from '../../media';
import { useBookKey, useGlobalApi } from '../../stores/bookStore';
import { bumpRecordVersion } from '../../stores/syncVersionStore';
import { EMPTY_USAGE } from '../core/messages';
import type { TokenUsage } from '../core/types';
import { hasUiMessageContent, toPersistedUiInput } from '../core/uiMessages';
import { createAgentTransport } from './agentTransport';
import { EMPTY_REPLY_MESSAGE, PARTIAL_SAVE_FAILED_MESSAGE } from './copy';
import { getErrorMessage, isAbortedError } from './errorMessage';
import type { AgentSessionState } from './useAgentSession';

interface UseAgentRuntimeOptions {
  book: BookRow;
  session: AgentSessionState;
  threadId: number | null;
  initialMessages: UIMessage[];
}

export interface AgentRuntimeHandle {
  runtime: AssistantRuntime;
  errorText: string;
}

interface FinishRunOptions {
  message: UIMessage;
  isAbort: boolean;
  isError: boolean;
}

export function useAgentRuntime({
  book,
  session,
  threadId,
  initialMessages,
}: UseAgentRuntimeOptions): AgentRuntimeHandle {
  const api = useGlobalApi();
  const bookKey = useBookKey();
  const media = useMediaStore();
  const [errorText, setErrorText] = useState('');
  const usageRef = useRef<TokenUsage>(EMPTY_USAGE);
  const activeThreadIdRef = useRef<number | null>(
    threadId && threadId > 0 ? threadId : null,
  );

  const { markActivity, ensureTitle, accumulateUsage, refreshThreads } =
    session;
  const ensureThread = session.ensureThread;

  const ensureThreadId = useCallback(async (): Promise<number | null> => {
    if (activeThreadIdRef.current !== null) {
      return activeThreadIdRef.current;
    }
    const nextId = await ensureThread();
    activeThreadIdRef.current = nextId;
    return nextId;
  }, [ensureThread]);

  const persistUserMessage = useCallback(
    async (message: UIMessage): Promise<void> => {
      const input = toPersistedUiInput(message);
      if (!input) {
        return;
      }
      const activeThreadId = activeThreadIdRef.current;
      if (activeThreadId === null) {
        throw new Error('当前会话尚未创建');
      }
      await api.agent.appendMessages(activeThreadId, [input]);
      markActivity();
    },
    [api, markActivity],
  );

  const transport = useMemo(() => {
    if (!media) {
      throw new Error('未找到当前账本');
    }
    return createAgentTransport({
      api,
      booksId: book.id,
      bookName: book.name,
      ensureThreadId,
      usageRef,
      media,
      persistUserMessage,
      ensureTitle,
      onRunStart: () => setErrorText(''),
      onRecordsChanged: bumpRecordVersion,
    });
  }, [
    api,
    book.id,
    book.name,
    ensureTitle,
    media,
    persistUserMessage,
    ensureThreadId,
  ]);

  const finishRun = useCallback(
    async ({ message, isAbort, isError }: FinishRunOptions): Promise<void> => {
      const usage = usageRef.current;
      usageRef.current = EMPTY_USAGE;

      if (usage.totalTokens > 0) {
        accumulateUsage(usage);
      }

      try {
        if (hasUiMessageContent(message)) {
          const input = toPersistedUiInput(
            message,
            usage.totalTokens > 0 ? usage : undefined,
          );
          if (input) {
            const activeThreadId = activeThreadIdRef.current;
            if (activeThreadId !== null) {
              await api.agent.appendMessages(activeThreadId, [input]);
            }
          }
        } else if (!isAbort && !isError) {
          setErrorText(EMPTY_REPLY_MESSAGE);
        }
      } catch {
        setErrorText(PARTIAL_SAVE_FAILED_MESSAGE);
      } finally {
        refreshThreads().catch(() => undefined);
      }
    },
    [accumulateUsage, api, refreshThreads],
  );

  const runtime = useChatRuntime<UIMessage>({
    id: `agent-book-${bookKey ?? book.id}`,
    messages: initialMessages,
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onFinish: options => {
      finishRun(options).catch(() => undefined);
    },
    onError: error => {
      if (!isAbortedError(error)) {
        setErrorText(getErrorMessage(error));
      }
    },
  });

  return { runtime, errorText };
}

export interface AgentRuntimeStatusBridgeProps {
  onChange: (isRunning: boolean) => void;
}

export function AgentRuntimeStatusBridge({
  onChange,
}: AgentRuntimeStatusBridgeProps): null {
  const isRunning = useAuiState(state => state.thread.isRunning);

  useEffect(() => {
    onChange(isRunning);
  }, [isRunning, onChange]);

  return null;
}
