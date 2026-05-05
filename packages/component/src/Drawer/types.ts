import type React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { Drawer as DrawerLayout } from 'react-native-drawer-layout';

export interface DrawerStyles {
  container?: StyleProp<ViewStyle>;
  drawer?: StyleProp<ViewStyle>;
  overlay?: StyleProp<ViewStyle>;
}

export interface DrawerProps
  extends Omit<
    React.ComponentProps<typeof DrawerLayout>,
    'drawerStyle' | 'overlayStyle' | 'style'
  > {
  width?: string | number;
  styles?: DrawerStyles;
  children: React.ReactNode;
}
