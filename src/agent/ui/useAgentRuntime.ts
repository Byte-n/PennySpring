import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIMessage,
} from 'ai';
import { useChatRuntime } from '@assistant-ui/ai-sdk';
import { useAuiState, type AssistantRuntime } from '@assistant-ui/react-native';
import type { BookRow } from '@pennyspring/api';

import { useGlobalApi } from '../../stores/bookStore';
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
  threadId: number;
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
  const [errorText, setErrorText] = useState('');
  const usageRef = useRef<TokenUsage>(EMPTY_USAGE);

  const { markActivity, ensureTitle, accumulateUsage, refreshThreads } =
    session;

  const persistUserMessage = useCallback(
    async (message: UIMessage): Promise<void> => {
      const input = toPersistedUiInput(message);
      if (!input) {
        return;
      }
      await api.agent.appendMessages(threadId, [input]);
      markActivity();
    },
    [api, markActivity, threadId],
  );

  const transport = useMemo(
    () =>
      createAgentTransport({
        api,
        booksId: book.id,
        bookName: book.name,
        threadId,
        usageRef,
        persistUserMessage,
        ensureTitle,
        onRunStart: () => setErrorText(''),
      }),
    [api, book.id, book.name, ensureTitle, persistUserMessage, threadId],
  );

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
            await api.agent.appendMessages(threadId, [input]);
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
    [accumulateUsage, api, refreshThreads, threadId],
  );

  const runtime = useChatRuntime<UIMessage>({
    id: `agent-thread-${threadId}`,
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
