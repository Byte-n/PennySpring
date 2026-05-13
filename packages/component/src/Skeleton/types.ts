import type { ReactNode } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SkeletonShape = 'line' | 'circle' | 'rect';
export type SkeletonSize = ComponentSize;

export interface SkeletonProps {
  shape?: SkeletonShape;
  size?: SkeletonSize;
  width?: DimensionValue;
  animated?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
