import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';
import type { FloatingActionButtonProps } from '../FloatingActionButton';

export type FloatingDirection = 'vertical' | 'horizontal' | 'radial';

export type FloatingPlacement =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'centerLeft'
  | 'centerRight';

export interface FloatingActionItem {
  key: string;
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onPress: () => void;
}

export interface FloatingActionGroupStyles {
  container?: StyleProp<ViewStyle>;
  moreButton?: StyleProp<ViewStyle>;
  actionButton?: FloatingActionButtonProps['style'];
}

export interface FloatingActionGroupProps {
  mountPoint?: PortalMountPoint;
  actions: FloatingActionItem[];
  defaultVisibleCount?: number;
  direction?: FloatingDirection;
  placement?: FloatingPlacement;
  position?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  offset?: {
    x?: number;
    y?: number;
  };
  collapseOnOutsidePress?: boolean;
  toggleOnMorePress?: boolean;
  spacing?: number;
  radialStartAngle?: number;
  radialSweepAngle?: number;
  radialRadius?: number;
  style?: StyleProp<ViewStyle>;
  styles?: FloatingActionGroupStyles;
}
