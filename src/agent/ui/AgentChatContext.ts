import { createContext, useContext } from 'react';

import type { AgentChatState } from './useAgentChat';

export const AgentChatContext = createContext<AgentChatState | null>(null);

export function useAgentChatState(): AgentChatState {
  const chat = useContext(AgentChatContext);

  if (chat === null) {
    throw new Error('useAgentChatState must be used inside AgentRoot.');
  }

  return chat;
}
