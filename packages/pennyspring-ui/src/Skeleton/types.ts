import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SkeletonShape = 'line' | 'circle' | 'rect';

export interface SkeletonStyles {
  root?: StyleProp<ViewStyle>;
}

export interface SkeletonProps {
  shape?: SkeletonShape;
  size?: ComponentSize;
  animated?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: SkeletonStyles;
  children?: ReactNode;
}
