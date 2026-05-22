import type React from 'react';

export type ComponentConfig = {};

export interface ConfigProviderProps {
  config?: ComponentConfig;
  children?: React.ReactNode;
}
