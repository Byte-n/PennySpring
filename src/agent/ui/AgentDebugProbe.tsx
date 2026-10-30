import { useEffect } from 'react';
import { useAuiState } from '@assistant-ui/react-native';

import { agentDebugLog } from '../core/debug';

function summarizeParts(
  parts: readonly {
    type: string;
    text?: string;
    status?: { type: string };
  }[],
): string[] {
  return parts.map(part => {
    if (part.type === 'text' || part.type === 'reasoning') {
      return `${part.type}:${part.text?.length ?? 0}:${
        part.status?.type ?? 'none'
      }`;
    }
    return part.type;
  });
}

export function AgentDebugProbe(): null {
  const messages = useAuiState(state => state.thread.messages);
  const isRunning = useAuiState(state => state.thread.isRunning);
  const last = messages[messages.length - 1];

  useEffect(() => {
    agentDebugLog('ui', 'thread-running', { isRunning });
  }, [isRunning]);

  useEffect(() => {
    if (!last || last.role !== 'assistant') {
      return;
    }
    agentDebugLog('ui', 'assistant-message', {
      id: last.id,
      running: isRunning,
      parts: summarizeParts(last.parts),
    });
  }, [isRunning, last]);

  return null;
}
