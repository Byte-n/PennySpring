import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { PortalMountPoint } from '../Portal/types';

export type DrawerPosition = 'left' | 'right';

export type DrawerType = 'front' | 'slide' | 'back';

export interface DrawerLayoutStyles {
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  drawer?: StyleProp<ViewStyle>;
  overlay?: StyleProp<ViewStyle>;
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  drawerPosition?: DrawerPosition;
  width?: number;
  swipeEnabled?: boolean;
  styles?: DrawerLayoutStyles;
  children: React.ReactNode;
  mountPoint?: PortalMountPoint;
}

export interface DrawerLayoutProps extends Omit<DrawerProps, 'mountPoint'> {
  drawerType?: DrawerType;
  renderDrawerContent: () => React.ReactNode;
}
