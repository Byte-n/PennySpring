import React, { createContext, useContext, useState, useMemo } from 'react';
import { defaultSeedToken, presets } from '@pennyspring/theme';
import type { SeedToken, ThemeAlgorithm } from '@pennyspring/theme';

export type ThemePresetName =
  | 'default'
  | 'april'
  | 'kaori'
  | 'penny'
  | 'spring';

export interface ThemePresetOption {
  name: ThemePresetName;
  label: string;
  color: string;
}

export const THEME_PRESET_OPTIONS: readonly ThemePresetOption[] = [
  { name: 'default', label: '默认', color: defaultSeedToken.colorPrimary },
  { name: 'april', label: '春绿', color: presets.april.colorPrimary as string },
  { name: 'kaori', label: '樱粉', color: presets.kaori.colorPrimary as string },
  { name: 'penny', label: '暖金', color: presets.penny.colorPrimary as string },
  {
    name: 'spring',
    label: '青碧',
    color: presets.spring.colorPrimary as string,
  },
];

const THEME_PRESET_TOKENS: Record<
  ThemePresetName,
  Partial<SeedToken> | undefined
> = {
  default: undefined,
  april: presets.april,
  kaori: presets.kaori,
  penny: presets.penny,
  spring: presets.spring,
};

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
