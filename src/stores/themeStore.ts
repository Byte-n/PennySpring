import type { ThemeAlgorithm, ThemePresetName } from '@pennyspring/ui';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { bookStorage } from './bookStorage';

const THEME_STORE_KEY = 'pennyspring-theme-store';

export interface ThemeSettings {
  themeMode: ThemeAlgorithm;
  themePreset: ThemePresetName;
}

interface ThemeStore extends ThemeSettings {
  setThemeMode: (mode: ThemeAlgorithm) => void;
  setThemePreset: (preset: ThemePresetName) => void;
  setTheme: (settings: ThemeSettings) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    set => ({
      themeMode: 'default',
      themePreset: 'default',
      setThemeMode: themeMode => set({ themeMode }),
      setThemePreset: themePreset => set({ themePreset }),
      setTheme: settings => set(settings),
    }),
    {
      name: THEME_STORE_KEY,
      storage: createJSONStorage(() => bookStorage),
      partialize: (state): ThemeSettings => ({
        themeMode: state.themeMode,
        themePreset: state.themePreset,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateThemeStore(
  initialMode: ThemeAlgorithm,
): Promise<void> {
  const stored = await bookStorage.getItem(THEME_STORE_KEY);
  await useThemeStore.persist.rehydrate();
  if (stored === null) {
    useThemeStore.getState().setThemeMode(initialMode);
  }
}

export function getThemeSettings(): ThemeSettings {
  const state = useThemeStore.getState();
  return {
    themeMode: state.themeMode,
    themePreset: state.themePreset,
  };
}
