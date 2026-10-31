import type React from 'react';
import type { ComponentConfig } from '../ConfigProvider';
import type { ThemeConfig } from '@pennyspring/theme';
import { StyleProp, ViewStyle } from 'react-native';

export interface AppProps {
  config?: ComponentConfig;
  themeConfig?: ThemeConfig;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
