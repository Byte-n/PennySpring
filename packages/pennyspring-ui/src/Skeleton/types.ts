import type { ReactNode } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
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
  /** 覆盖默认宽度，支持数字与百分比。 */
  width?: DimensionValue;
  /** 覆盖默认高度。 */
  height?: number;
  /** 覆盖默认圆角。 */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  styles?: SkeletonStyles;
  children?: ReactNode;
}
