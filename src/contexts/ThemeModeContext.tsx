import React, { createContext, useContext, useState, useMemo } from 'react';
import { defaultSeedToken, themePresets } from '@pennyspring/theme';
import type {
  SeedToken,
  ThemeAlgorithm,
  ThemePreset,
  ThemePresetName,
} from '@pennyspring/theme';

export type { ThemePresetName } from '@pennyspring/theme';

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
  const [themeMode, setThemeMode] = useState<ThemeAlgorithm>(initialMode);
  const [themePreset, setThemePreset] = useState<ThemePresetName>('default');

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
    [themeMode, themePreset, themeToken],
  );

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
