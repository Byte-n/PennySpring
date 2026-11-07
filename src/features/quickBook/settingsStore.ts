import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSqliteStateStorage } from '../../stores/bookStorage';
import {
  DEFAULT_QUICK_BOOK_PROMPT,
  DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
  LEGACY_DEFAULT_QUICK_BOOK_PROMPT,
  MAX_SCREENSHOT_FRESH_WINDOW_SECONDS,
  PREVIOUS_DEFAULT_QUICK_BOOK_PROMPT,
  MIN_SCREENSHOT_FRESH_WINDOW_SECONDS,
} from './constants';

const QUICK_BOOK_SETTINGS_STORE_KEY = 'pennyspring-quick-book-settings-v2';
const QUICK_BOOK_SETTINGS_STORE_VERSION = 6;

/** 快捷记账的设备级设置；provider/model 属于服务器级选择，见 api.quickBook。 */
export interface QuickBookSettings {
  freshWindowSeconds: number;
  presetPrompt: string;
  nudgeEnabled: boolean;
  /** 截图触发的快捷记账直接写入，不再弹出新增记录确认卡片。 */
  autoApproveScreenshot: boolean;
  /** 悬浮球截图记账：仅 Android 本地账本生效，设备级开关。 */
  floatingBallEnabled: boolean;
  /** 这些包名位于前台时不显示悬浮球；默认空。 */
  excludedPackages: string[];
}

interface QuickBookSettingsStore extends QuickBookSettings {
  setFreshWindowSeconds: (seconds: number) => void;
  setPresetPrompt: (prompt: string) => void;
  setNudgeEnabled: (enabled: boolean) => void;
  setAutoApproveScreenshot: (enabled: boolean) => void;
  setFloatingBallEnabled: (enabled: boolean) => void;
  setExcludedPackages: (packages: readonly string[]) => void;
}

export function normalizeExcludedPackages(
  packages: readonly unknown[],
): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const packageName of packages) {
    if (typeof packageName !== 'string') {
      continue;
    }
    const trimmed = packageName.trim();
    if (trimmed === '' || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
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
  freshWindowSeconds: DEFAULT_SCREENSHOT_FRESH_WINDOW_SECONDS,
  presetPrompt: DEFAULT_QUICK_BOOK_PROMPT,
  nudgeEnabled: false,
  autoApproveScreenshot: true,
  floatingBallEnabled: false,
  excludedPackages: [],
};

export function migrateQuickBookSettings(
  persistedState: unknown,
  version: number,
): QuickBookSettings {
  const state = (persistedState ?? {}) as Partial<QuickBookSettings>;
  const migrated = {
    ...DEFAULT_SETTINGS,
    ...state,
    excludedPackages: normalizeExcludedPackages(
      Array.isArray(state.excludedPackages) ? state.excludedPackages : [],
    ),
  };
  if (
    version < QUICK_BOOK_SETTINGS_STORE_VERSION &&
    (state.presetPrompt === LEGACY_DEFAULT_QUICK_BOOK_PROMPT ||
      state.presetPrompt === PREVIOUS_DEFAULT_QUICK_BOOK_PROMPT)
  ) {
    return { ...migrated, presetPrompt: DEFAULT_QUICK_BOOK_PROMPT };
  }
  return migrated;
}

export const useQuickBookSettingsStore = create<QuickBookSettingsStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      setFreshWindowSeconds: seconds => {
        set({ freshWindowSeconds: clampFreshWindowSeconds(seconds) });
      },
      setPresetPrompt: presetPrompt => {
        set({ presetPrompt });
      },
      setNudgeEnabled: nudgeEnabled => {
        set({ nudgeEnabled });
      },
      setAutoApproveScreenshot: autoApproveScreenshot => {
        set({ autoApproveScreenshot });
      },
      setFloatingBallEnabled: floatingBallEnabled => {
        set({ floatingBallEnabled });
      },
      setExcludedPackages: packages => {
        set({ excludedPackages: normalizeExcludedPackages(packages) });
      },
    }),
    {
      name: QUICK_BOOK_SETTINGS_STORE_KEY,
      storage: createJSONStorage(() => createSqliteStateStorage()),
      partialize: (state): QuickBookSettings => ({
        freshWindowSeconds: state.freshWindowSeconds,
        presetPrompt: state.presetPrompt,
        nudgeEnabled: state.nudgeEnabled,
        autoApproveScreenshot: state.autoApproveScreenshot,
        floatingBallEnabled: state.floatingBallEnabled,
        excludedPackages: state.excludedPackages,
      }),
      skipHydration: true,
      version: QUICK_BOOK_SETTINGS_STORE_VERSION,
      migrate: migrateQuickBookSettings,
    },
  ),
);

export async function rehydrateQuickBookSettings(): Promise<void> {
  await useQuickBookSettingsStore.persist.rehydrate();
}

export function getQuickBookSettings(): QuickBookSettings {
  const state = useQuickBookSettingsStore.getState();
  return {
    freshWindowSeconds: state.freshWindowSeconds,
    presetPrompt: state.presetPrompt,
    nudgeEnabled: state.nudgeEnabled,
    autoApproveScreenshot: state.autoApproveScreenshot,
    floatingBallEnabled: state.floatingBallEnabled,
    excludedPackages: state.excludedPackages,
  };
}
