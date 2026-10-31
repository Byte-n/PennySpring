import type React from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type GridGap = number | ComponentSize;

export interface GridProps {
  columns: number;
  gap?: GridGap;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface GridItemProps {
  span?: number;
  disabled?: boolean;
  testID?: string;
  onPress?: (event: GestureResponderEvent) => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
