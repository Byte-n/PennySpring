import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type DividerDirection = 'horizontal' | 'vertical';

export type DividerContentPosition = 'left' | 'center' | 'right';

export interface DividerStyles {
  content?: StyleProp<TextStyle>;
  line?: StyleProp<ViewStyle>;
}

export interface DividerProps {
  children?: ReactNode;
  contentPosition?: DividerContentPosition;
  direction?: DividerDirection;
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  styles?: DividerStyles;
}
