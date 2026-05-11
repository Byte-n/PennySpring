import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type ResultStatus = 'success' | 'warning' | 'error' | 'info';

export type ResultSize = ComponentSize;

export interface ResultStyles {
  iconContainer?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  subtitle?: StyleProp<TextStyle>;
  extra?: StyleProp<ViewStyle>;
}

export interface ResultProps {
  status?: ResultStatus;
  size?: ResultSize;
  icon?: ReactNode;
  titleText?: string;
  title?: ReactNode;
  subtitleText?: string;
  subtitle?: ReactNode;
  extra?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ResultStyles;
}
