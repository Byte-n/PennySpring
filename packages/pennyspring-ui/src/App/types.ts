import type React from 'react';
import type { ComponentConfig } from '../ConfigProvider';
import { StyleProp, ViewStyle } from 'react-native';

export interface AppProps {
  config?: ComponentConfig;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
