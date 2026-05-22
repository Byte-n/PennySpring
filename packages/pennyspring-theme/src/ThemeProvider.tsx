import React, { createContext, useMemo } from 'react';
import type { AliasToken, SeedToken } from './types';
import { defaultSeedToken } from './defaults';
import { derivative } from './algorithms/derivative';
import { formatToken } from './algorithms/formatToken';

export type ThemeAlgorithm = 'default' | 'dark';

export interface ThemeConfig {
  token?: Partial<AliasToken>;
  algorithm?: ThemeAlgorithm | ThemeAlgorithm[];
}

export interface ThemeContextValue {
  token: AliasToken;
}

function normalizeAlgorithms(raw?: ThemeAlgorithm | ThemeAlgorithm[]): ThemeAlgorithm[] {
  if (!raw) return ['default'];
  return Array.isArray(raw) ? raw : [raw];
}

function extractSeedOverrides(tokenOverrides: Partial<AliasToken>): Partial<SeedToken> {
  const overrides: Record<string, unknown> = {};
  for (const key of Object.keys(tokenOverrides)) {
    if (key in defaultSeedToken) {
      overrides[key] = tokenOverrides[key as keyof AliasToken];
    }
  }
  return overrides as Partial<SeedToken>;
}

function buildContextValue(): ThemeContextValue {
  const mapToken = derivative(defaultSeedToken, false);
  return { token: formatToken(mapToken) };
}

export const ThemeContext = createContext<ThemeContextValue>(buildContextValue());

interface ThemeProviderProps {
  config?: ThemeConfig;
  children: React.ReactNode;
}

export function ThemeProvider({ config, children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(() => {
    const algorithms = normalizeAlgorithms(config?.algorithm);
    const isDark = algorithms.includes('dark');

    const tokenOverrides = config?.token ?? {};
    const seedOverrides = extractSeedOverrides(tokenOverrides);

    const seed: SeedToken = { ...defaultSeedToken, ...seedOverrides };
    const mapToken = derivative(seed, isDark);
    const aliasToken = formatToken(mapToken);

    return { token: { ...aliasToken, ...tokenOverrides } };
  }, [config?.token, config?.algorithm]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
