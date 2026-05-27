import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type FlexAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';

export type FlexJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'between'
  | 'around'
  | 'evenly';

export interface RowProps {
  align?: FlexAlign;
  justify?: FlexJustify;
  gap?: number | ComponentSize;
  wrap?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface ColumnProps {
  align?: FlexAlign;
  justify?: FlexJustify;
  gap?: number | ComponentSize;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
