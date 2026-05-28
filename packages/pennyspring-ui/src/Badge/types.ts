import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { SemanticPresetColor } from '../shares/color';

export type BadgeSemanticColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type BadgeColor = SemanticPresetColor<BadgeSemanticColor>;

export interface BadgeStyles {
  indicator?: StyleProp<ViewStyle>;
  dot?: StyleProp<ViewStyle>;
  content?: StyleProp<TextStyle>;
}

export interface BadgeProps extends Omit<ViewProps, 'style'> {
  count?: ReactNode;
  showZero?: boolean;
  /** 默认值为 99，超过时显示为 `${overflowCount}+`。 */
  overflowCount?: number;
  dot?: boolean;
  offset?: number | [number, number];
  size?: ComponentSize;
  color?: BadgeColor;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: BadgeStyles;
}
