import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';
import type { AliasToken } from './types';

export function useTheme(): { token: AliasToken } {
  return useContext(ThemeContext);
}
