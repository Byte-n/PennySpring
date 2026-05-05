import type React from 'react';

export interface PageConfig {
  onBack?: () => void;
}

export interface ComponentConfig {
  page?: PageConfig;
}

export interface ConfigProviderProps extends ComponentConfig {
  config?: ComponentConfig;
  children?: React.ReactNode;
}
