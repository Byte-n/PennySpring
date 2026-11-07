import { createContext, useContext } from 'react';

import type {
  QuickBookImage,
  QuickBookStartResult,
} from '../../features/quickBook/types';

export interface AgentLauncher {
  openAgent: () => void;
  startQuickBook: (image: QuickBookImage) => Promise<QuickBookStartResult>;
}

export const AgentLauncherContext = createContext<AgentLauncher | null>(null);

export function useAgentLauncher(): AgentLauncher {
  const launcher = useContext(AgentLauncherContext);

  if (launcher === null) {
    throw new Error('useAgentLauncher must be used inside AgentRoot.');
  }

  return launcher;
}
