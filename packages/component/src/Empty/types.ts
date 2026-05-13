import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface EmptyStyles {
  iconContainer?: StyleProp<ViewStyle>;
  message?: StyleProp<TextStyle>;
}

export interface EmptyProps {
  size?: ComponentSize;
  icon?: ReactNode;
  messageText?: string;
  message?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: EmptyStyles;
}
