import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type TagSize = ComponentSize;

export type TagColor =
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

export type TagVariant = 'filled' | 'outlined' | 'solid';

export interface TagStyles {
  content?: StyleProp<TextStyle>;
  contentDisabled?: StyleProp<TextStyle>;
}

export interface TagProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled'> {
  children?: ReactNode;
  size?: TagSize;
  color?: TagColor;
  variant?: TagVariant;
  disabled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  styles?: TagStyles;
}
