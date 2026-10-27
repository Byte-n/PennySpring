import { createContext, useContext } from 'react';

export interface AgentLauncher {
  openAgent: () => void;
}

export const AgentLauncherContext = createContext<AgentLauncher | null>(null);

export function useAgentLauncher(): AgentLauncher {
  const launcher = useContext(AgentLauncherContext);

  if (launcher === null) {
    throw new Error('useAgentLauncher must be used inside AgentRoot.');
  }

  return launcher;
}
