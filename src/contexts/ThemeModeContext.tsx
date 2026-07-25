import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ThemeAlgorithm } from '@pennyspring/theme';

interface ThemeModeContextValue {
  themeMode: ThemeAlgorithm;
  setThemeMode: (mode: ThemeAlgorithm) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined
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

  const value = useMemo(
    () => ({ themeMode, setThemeMode }),
    [themeMode]
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
