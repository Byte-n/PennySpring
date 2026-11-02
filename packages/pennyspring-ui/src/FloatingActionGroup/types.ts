import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ButtonProps } from '../Button';
import type { IconComponent, IconName } from '../Icon';
import type { PortalMountPoint } from '../Portal/types';
import type { ComponentSize } from '../shares/types';

export type FloatingPlacement =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'centerLeft'
  | 'centerRight';

export type FloatingLayout = 'grid' | 'fan';

export interface FloatingActionItem {
  key: string;
  label?: string;
  icon?: IconName | IconComponent;
  disabled?: boolean;
  onPress?: () => void;
  buttonProps?: Omit<
    ButtonProps,
    'children' | 'icon' | 'onPress' | 'size' | 'style' | 'styles'
  >;
}

export interface FloatingActionGroupStyles {
  root?: StyleProp<ViewStyle>;
  trigger?: StyleProp<ViewStyle>;
  actionButton?: StyleProp<ViewStyle>;
  actionLabel?: StyleProp<TextStyle>;
  overlay?: StyleProp<ViewStyle>;
  edgeRail?: StyleProp<ViewStyle>;
}

export interface FloatingActionGroupProps {
  mountPoint?: PortalMountPoint;
  actions: FloatingActionItem[];
  layout?: FloatingLayout;
  draggable?: boolean;
  snapToEdge?: boolean;
  placement?: FloatingPlacement;
  offset?: {
    x?: number;
    y?: number;
  };
  collapseOnOutsidePress?: boolean;
  size?: ComponentSize;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  styles?: FloatingActionGroupStyles;
}
