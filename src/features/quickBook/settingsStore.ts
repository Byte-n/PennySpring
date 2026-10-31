import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';
import {
  DEFAULT_QUICK_BOOK_PROMPT,
  DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
  MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
  MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
} from './constants';

const QUICK_BOOK_SETTINGS_STORE_KEY = 'pennyspring-quick-book-settings-v1';

export interface QuickBookSettings {
  providerId: string | null;
  modelId: string | null;
  freshWindowSeconds: number;
  presetPrompt: string;
  nudgeEnabled: boolean;
}

interface QuickBookSettingsStore extends QuickBookSettings {
  setProviderId: (providerId: string | null) => void;
  setModelId: (modelId: string | null) => void;
  setFreshWindowSeconds: (seconds: number) => void;
  setPresetPrompt: (prompt: string) => void;
  setNudgeEnabled: (enabled: boolean) => void;
}

export function clampFreshWindowSeconds(seconds: number): number {
  if (!Number.isFinite(seconds)) {
    return DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS;
  }
  return Math.min(
    MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
    Math.max(MIN_SCREENSHOT_FRESH_WINDOW_SECONDS, Math.round(seconds)),
  );
}

const DEFAULT_SETTINGS: QuickBookSettings = {
  providerId: null,
  modelId: null,
  freshWindowSeconds: DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
  presetPrompt: DEFAULT_QUICK_BOOK_PROMPT,
  nudgeEnabled: false,
};

export const useQuickBookSettingsStore = create<QuickBookSettingsStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      setProviderId: providerId => {
        set({ providerId });
      },
      setModelId: modelId => {
        set({ modelId });
      },
      setFreshWindowSeconds: seconds => {
        set({ freshWindowSeconds: clampFreshWindowSeconds(seconds) });
      },
      setPresetPrompt: presetPrompt => {
        set({ presetPrompt });
      },
      setNudgeEnabled: nudgeEnabled => {
        set({ nudgeEnabled });
      },
    }),
    {
      name: QUICK_BOOK_SETTINGS_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: (state): QuickBookSettings => ({
        providerId: state.providerId,
        modelId: state.modelId,
        freshWindowSeconds: state.freshWindowSeconds,
        presetPrompt: state.presetPrompt,
        nudgeEnabled: state.nudgeEnabled,
      }),
      skipHydration: true,
      version: 1,
    },
  ),
);

export async function rehydrateQuickBookSettings(): Promise<void> {
  await useQuickBookSettingsStore.persist.rehydrate();
}

export function getQuickBookSettings(): QuickBookSettings {
  const state = useQuickBookSettingsStore.getState();
  return {
    providerId: state.providerId,
    modelId: state.modelId,
    freshWindowSeconds: state.freshWindowSeconds,
    presetPrompt: state.presetPrompt,
    nudgeEnabled: state.nudgeEnabled,
  };
}
