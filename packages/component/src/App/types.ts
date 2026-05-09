import type React from 'react';
import type { ComponentConfig } from '../ConfigProvider';

export interface AppProps {
  config?: ComponentConfig;
  children?: React.ReactNode;
}
