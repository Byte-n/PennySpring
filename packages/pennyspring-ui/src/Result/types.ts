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
  icon?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  subtitleText?: string;
  subtitle?: ReactNode;
  extra?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ResultStyles;
}
