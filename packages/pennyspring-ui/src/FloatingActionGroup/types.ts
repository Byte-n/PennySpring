import type { StyleProp, ViewStyle } from 'react-native';
import type { IconComponent, IconName } from '../Icon';
import type { PortalMountPoint } from '../Portal/types';

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
}

export interface FloatingActionGroupStyles {
  container?: StyleProp<ViewStyle>;
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
  spacing?: number;
  style?: StyleProp<ViewStyle>;
  styles?: FloatingActionGroupStyles;
}
