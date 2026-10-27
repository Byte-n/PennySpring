import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';

const AGENT_CONFIG_STORE_KEY = 'pennyspring-agent-config';

export interface AgentConfig {
  baseUrl: string;
  model: string;
}

interface AgentConfigStore extends AgentConfig {
  setConfig: (config: AgentConfig) => void;
  resetConfig: () => void;
}

interface PersistedAgentConfig {
  baseUrl: string;
  model: string;
}

let rehydrateAgentConfig = async (): Promise<void> => undefined;

export const useAgentConfigStore = create<AgentConfigStore>()(
  persist(
    set => ({
      baseUrl: '',
      model: '',
      setConfig: config => {
        set({ baseUrl: config.baseUrl.trim(), model: config.model.trim() });
      },
      resetConfig: () => {
        set({ baseUrl: '', model: '' });
      },
    }),
    {
      name: AGENT_CONFIG_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: (state): PersistedAgentConfig => ({
        baseUrl: state.baseUrl,
        model: state.model,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

rehydrateAgentConfig = async (): Promise<void> => {
  await useAgentConfigStore.persist.rehydrate();
};

export { rehydrateAgentConfig };

export function getAgentConfig(): AgentConfig {
  const { baseUrl, model } = useAgentConfigStore.getState();
  return { baseUrl, model };
}
