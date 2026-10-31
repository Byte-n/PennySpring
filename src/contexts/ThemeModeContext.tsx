import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { defaultSeedToken, themePresets } from '@pennyspring/ui';
import type {
  SeedToken,
  ThemeAlgorithm,
  ThemePreset,
  ThemePresetName,
} from '@pennyspring/ui';

import { rehydrateThemeStore, useThemeStore } from '../stores/themeStore';

export type { ThemePresetName } from '@pennyspring/ui';

export interface ThemePresetOption {
  name: ThemePresetName;
  label: string;
  color: string;
}

export const THEME_PRESET_OPTIONS: readonly ThemePresetOption[] =
  themePresets.map((preset: ThemePreset) => ({
    name: preset.value,
    label: preset.label,
    color: preset.data.colorPrimary ?? defaultSeedToken.colorPrimary,
  }));

const THEME_PRESET_TOKENS = Object.fromEntries(
  themePresets.map((preset: ThemePreset) => [preset.value, preset.data]),
) as Record<ThemePresetName, Partial<SeedToken>>;

interface ThemeModeContextValue {
  themeMode: ThemeAlgorithm;
  setThemeMode: (mode: ThemeAlgorithm) => void;
  themePreset: ThemePresetName;
  setThemePreset: (preset: ThemePresetName) => void;
  themeToken: Partial<SeedToken> | undefined;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined,
);

interface ThemeModeProviderProps {
  initialMode?: ThemeAlgorithm;
  children: React.ReactNode;
}

export function ThemeModeProvider({
  initialMode = 'default',
  children,
}: ThemeModeProviderProps) {
  const [ready, setReady] = useState(false);
  const themeMode = useThemeStore(state => state.themeMode);
  const themePreset = useThemeStore(state => state.themePreset);
  const setThemeMode = useThemeStore(state => state.setThemeMode);
  const setThemePreset = useThemeStore(state => state.setThemePreset);

  useEffect(() => {
    let cancelled = false;
    rehydrateThemeStore(initialMode)
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initialMode]);

  const themeToken = useMemo(
    () => THEME_PRESET_TOKENS[themePreset],
    [themePreset],
  );

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      themePreset,
      setThemePreset,
      themeToken,
    }),
    [themeMode, setThemeMode, themePreset, setThemePreset, themeToken],
  );

  if (!ready) {
    return null;
  }

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}
