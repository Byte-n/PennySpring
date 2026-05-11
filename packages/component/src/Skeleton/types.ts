import type { ReactNode } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';

export type SkeletonShape = 'line' | 'circle' | 'rect';

export interface SkeletonProps {
  shape?: SkeletonShape;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  animated?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
