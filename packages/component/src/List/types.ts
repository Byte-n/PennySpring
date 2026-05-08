import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type ListSize = ComponentSize;

export type ListDivider = 'none' | 'inset' | 'full';

export interface ListStyles {
  header?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
}

export interface ListItemStyles {
  left?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  right?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  description?: StyleProp<TextStyle>;
  itemPressed?: StyleProp<ViewStyle>;
  itemSelected?: StyleProp<ViewStyle>;
  itemDisabled?: StyleProp<ViewStyle>;
  divider?: StyleProp<ViewStyle>;
}

export interface ListProps {
  size?: ListSize;
  header?: ReactNode;
  footer?: ReactNode;
  divider?: ListDivider;
  empty?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ListStyles;
}

export interface ListItemProps {
  size?: ListSize;
  left?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  selected?: boolean;
  disabled?: boolean;
  divider?: ListDivider;
  style?: StyleProp<ViewStyle>;
  styles?: ListItemStyles;
}
