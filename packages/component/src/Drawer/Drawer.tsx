import { StyleSheet, View, ViewStyle } from 'react-native';
import { Drawer as DrawerLayoutRN } from 'react-native-drawer-layout';
import { createUseSheetStyle } from '@pennyspring/theme';
import { DrawerLayoutProps, DrawerProps } from './types';
import { PortalContext } from '../Portal/Portal.tsx';
import { resolvePortalMount } from '../Portal/resolvePortalMount.tsx';
import { useContext, useEffect, useState } from 'react';
import { open } from '@op-engineering/op-sqlite';

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

function DrawerLayout({ width, styles, ...rest }: DrawerLayoutProps) {
  const tokenStyles = useStyles({ width });

  return (
    <DrawerLayoutRN
      {...rest}
      drawerStyle={[tokenStyles.drawer, styles?.drawer]}
      overlayStyle={[tokenStyles.overlay, styles?.overlay]}
      style={styles?.container}
    />
  );
}

function DrawerComponent(props: DrawerProps) {
  const { children, mountPoint = 'auto', open } = props;
  const portalContext = useContext(PortalContext);

  return resolvePortalMount(
    open && (
      <View style={StyleSheet.absoluteFill}>
        <DrawerLayout {...props} renderDrawerContent={() => children}>
          <View pointerEvents="none" style={StyleSheet.absoluteFill} />
        </DrawerLayout>
      </View>
    ),
    mountPoint,
    portalContext !== null,
  );
}
export const Drawer = Object.assign(DrawerComponent, {
  Layout: DrawerLayout,
});
