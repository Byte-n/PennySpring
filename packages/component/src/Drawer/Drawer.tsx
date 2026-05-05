import React from 'react';
import type { ViewStyle } from 'react-native';
import { Drawer as DrawerLayout } from 'react-native-drawer-layout';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { DrawerProps } from './types';

interface DrawerStyleOptions {
  width?: string | number;
}

const DEFAULT_DRAWER_WIDTH = '70%';

const useStyles = createUseSheetStyle(
  (token, { width }: DrawerStyleOptions) => ({
    drawer: {
      backgroundColor: token.colorBgElevated,
      padding: token.paddingLG,
      width: (width ?? DEFAULT_DRAWER_WIDTH) as ViewStyle['width'],
    },
    overlay: {
      backgroundColor: token.colorBgMask,
    },
  }),
);

export function Drawer({ width, styles, ...rest }: DrawerProps) {
  const tokenStyles = useStyles({ width });

  return (
    <DrawerLayout
      {...rest}
      drawerStyle={[tokenStyles.drawer, styles?.drawer]}
      overlayStyle={[tokenStyles.overlay, styles?.overlay]}
      style={styles?.container}
    />
  );
}
