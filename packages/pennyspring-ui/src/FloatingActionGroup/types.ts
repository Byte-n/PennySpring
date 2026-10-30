import type { StyleProp, ViewStyle } from 'react-native';
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

export interface FloatingActionItem {
  key: string;
  label?: string;
  icon?: IconName | IconComponent;
  disabled?: boolean;
  onPress: () => void;
  buttonProps?: Omit<
    ButtonProps,
    'children' | 'icon' | 'onPress' | 'size' | 'style' | 'styles'
  >;
}

export interface FloatingActionGroupStyles {
  root?: StyleProp<ViewStyle>;
  moreButton?: StyleProp<ViewStyle>;
  actionButton?: StyleProp<ViewStyle>;
}

export interface FloatingActionGroupProps {
  mountPoint?: PortalMountPoint;
  actions: FloatingActionItem[];
  defaultVisibleCount?: number;
  placement?: FloatingPlacement;
  offset?: {
    x?: number;
    y?: number;
  };
  collapseOnOutsidePress?: boolean;
  toggleOnMorePress?: boolean;
  size?: ComponentSize;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  styles?: FloatingActionGroupStyles;
}
