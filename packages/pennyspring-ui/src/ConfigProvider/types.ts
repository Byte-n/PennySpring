import type React from 'react';

export interface ComponentConfig {
  locale?: string;
  fallbackLocale?: string;
}

export interface ConfigProviderProps {
  config?: ComponentConfig;
  children?: React.ReactNode;
}
