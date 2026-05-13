import type { ReactNode } from 'react';
import type { ActivityIndicatorProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface LoadingStyles {
  indicator?: StyleProp<ViewStyle>;
  text?: StyleProp<TextStyle>;
}

export interface LoadingProps
  extends Omit<ActivityIndicatorProps, 'size' | 'style' | 'color'> {
  size?: ComponentSize;
  text?: ReactNode;
  vertical?: boolean;
  indicator?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: LoadingStyles;
}
