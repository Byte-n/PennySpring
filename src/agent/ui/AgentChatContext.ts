import { createContext, useContext } from 'react';

import type { AgentSessionState } from './useAgentSession';

export const AgentChatContext = createContext<AgentSessionState | null>(null);

export function useAgentChatState(): AgentSessionState {
  const chat = useContext(AgentChatContext);

  if (chat === null) {
    throw new Error('useAgentChatState must be used inside AgentRoot.');
  }

  return chat;
}
