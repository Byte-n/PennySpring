import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { bookStorage } from '../../stores/bookStorage';

const AUTO_UPDATE_STORE_KEY = 'pennyspring-auto-update';

interface AutoUpdateSettings {
  autoCheckEnabled: boolean;
}

interface AutoUpdateStore extends AutoUpdateSettings {
  setAutoCheckEnabled: (enabled: boolean) => void;
}

export const useAutoUpdateStore = create<AutoUpdateStore>()(
  persist(
    set => ({
      autoCheckEnabled: true,
      setAutoCheckEnabled: autoCheckEnabled => set({ autoCheckEnabled }),
    }),
    {
      name: AUTO_UPDATE_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): AutoUpdateSettings => ({
        autoCheckEnabled: state.autoCheckEnabled,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateAutoUpdate(): Promise<void> {
  await useAutoUpdateStore.persist.rehydrate();
}

export function getAutoUpdateSettings(): AutoUpdateSettings {
  return {
    autoCheckEnabled: useAutoUpdateStore.getState().autoCheckEnabled,
  };
}
