import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface EmptyStyles {
  iconContainer?: StyleProp<ViewStyle>;
  message?: StyleProp<TextStyle>;
}

export interface EmptyProps {
  size?: ComponentSize;
  icon?: ReactNode | null;
  messageText?: string;
  message?: ReactNode | null;
  style?: StyleProp<ViewStyle>;
  styles?: EmptyStyles;
}
