import { createContext, useContext } from 'react';

import type {
  QuickBookImage,
  QuickBookSource,
  QuickBookStartResult,
} from '../../features/quickBook/types';

export interface AgentLauncher {
  openAgent: () => void;
  startQuickBook: (
    image: QuickBookImage,
    source: QuickBookSource,
  ) => Promise<QuickBookStartResult>;
}

export const AgentLauncherContext = createContext<AgentLauncher | null>(null);

export function useAgentLauncher(): AgentLauncher {
  const launcher = useContext(AgentLauncherContext);

  if (launcher === null) {
    throw new Error('useAgentLauncher must be used inside AgentRoot.');
  }

  return launcher;
}
