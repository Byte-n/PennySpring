import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { ListDivider } from '../List';

export type ListGroupSize = ComponentSize;

export interface ListGroupStyles {
  header?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  summary?: StyleProp<ViewStyle>;
  list?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface ListGroupProps {
  size?: ListGroupSize;
  title?: ReactNode;
  summary?: ReactNode;
  footer?: ReactNode;
  divider?: ListDivider;
  empty?: ReactNode;
  hideWhenEmpty?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: ListGroupStyles;
}
