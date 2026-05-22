import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface Geometry {
  width: number;
  height: number;
}

export interface GeometryReaderProps {
  children: (geometry: Geometry) => ReactNode;
  defaultGeometry?: Geometry;
  style?: StyleProp<ViewStyle>;
}
