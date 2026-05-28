import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type ResultStatus = 'success' | 'warning' | 'error' | 'info';

export interface ResultStyles {
  iconContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  subtitleText?: StyleProp<TextStyle>;
  extra?: StyleProp<ViewStyle>;
}

export interface ResultProps {
  status?: ResultStatus;
  size?: ComponentSize;
  icon?: ReactNode | null;
  titleText?: string;
  title?: ReactNode | null;
  subtitleText?: string;
  subtitle?: ReactNode | null;
  extra?: ReactNode | null;
  style?: StyleProp<ViewStyle>;
  styles?: ResultStyles;
}
