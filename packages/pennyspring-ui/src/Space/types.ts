import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SpaceDirection = 'horizontal' | 'vertical';

export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';

export type SpaceJustify =
  'start' | 'end' | 'center' | 'between' | 'around' | 'evenly' | 'stretch';

export interface SpaceStyles {
  item?: StyleProp<ViewStyle>;
}

export interface SpaceProps {
  gap?: number | ComponentSize;
  direction?: SpaceDirection;
  align?: SpaceAlign;
  justify?: SpaceJustify;
  wrap?: boolean;
  block?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: SpaceStyles;
}
