import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { SemanticPresetColor } from '../shares/color';

export type TagSemanticColor =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type TagColor = SemanticPresetColor<TagSemanticColor>;

export type TagVariant = 'filled' | 'outlined' | 'solid';

export interface TagStyles {
  root?: StyleProp<ViewStyle>;
  content?: StyleProp<TextStyle>;
}

export interface TagProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled'> {
  children?: ReactNode;
  size?: ComponentSize;
  color?: TagColor;
  variant?: TagVariant;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: TagStyles;
}
