import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { Drawer as DrawerLayoutRN } from 'react-native-drawer-layout';
import type { PortalMountPoint } from '../Portal';

export interface DrawerLayoutStyles {
  container?: StyleProp<ViewStyle>;
  drawer?: StyleProp<ViewStyle>;
  overlay?: StyleProp<ViewStyle>;
}

export interface DrawerLayoutProps
  extends Omit<
    React.ComponentProps<typeof DrawerLayoutRN>,
    'drawerStyle' | 'overlayStyle' | 'style'
  > {
  width?: string | number;
  styles?: DrawerLayoutStyles;
  children: React.ReactNode;
}

export interface DrawerProps
  extends Omit<DrawerLayoutProps, 'renderDrawerContent' | 'children'> {
  mountPoint?: PortalMountPoint;
  children: React.ReactNode;
}
