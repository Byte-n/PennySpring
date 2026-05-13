import type { ReactNode } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SkeletonShape = 'line' | 'circle' | 'rect';

export interface SkeletonProps {
  shape?: SkeletonShape;
  size?: ComponentSize;
  width?: DimensionValue;
  animated?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
