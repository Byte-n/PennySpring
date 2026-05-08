import type React from 'react';

export type ComponentConfig = Record<string, never>;

export interface ConfigProviderProps {
  config?: ComponentConfig;
  children?: React.ReactNode;
}
