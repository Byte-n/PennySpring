import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type BadgeSize = ComponentSize;

export type BadgeColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold';

export interface BadgeStyles {
  indicator?: StyleProp<ViewStyle>;
  dot?: StyleProp<ViewStyle>;
  content?: StyleProp<TextStyle>;
}

export interface BadgeProps extends Omit<ViewProps, 'style'> {
  count?: ReactNode;
  showZero?: boolean;
  overflowCount?: number;
  dot?: boolean;
  size?: BadgeSize;
  color?: BadgeColor;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: BadgeStyles;
}
