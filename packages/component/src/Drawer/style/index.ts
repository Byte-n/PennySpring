import { StyleSheet, type ViewStyle } from 'react-native';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { DrawerPosition } from '../types';

export interface DrawerStyleOptions {
  position: DrawerPosition;
  width: number;
}

function getOverlayLayout(position: DrawerPosition): ViewStyle {
  if (position === 'right') {
    return {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    };
  }

  return {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  };
}

function getDrawerPosition(position: DrawerPosition): ViewStyle {
  if (position === 'right') {
    return {
      right: 0,
    };
  }

  return {
    left: 0,
  };
}

export const useStyles = createUseSheetStyle(
  (token, { position, width }: DrawerStyleOptions) => ({
    container: {
      flex: 1,
      overflow: 'hidden',
      backgroundColor: token.colorBgContainer,
    },
    scene: {
      flex: 1,
      zIndex: token.zIndexBase,
      backgroundColor: token.colorBgContainer,
    },
    sceneMask: {
      ...StyleSheet.absoluteFill,
      backgroundColor: token.colorBgMask,
      zIndex: token.zIndexBase + 1,
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      ...getOverlayLayout(position),
      zIndex: token.zIndexPopupBase,
    },
    drawer: {
      ...getDrawerPosition(position),
      position: 'absolute',
      top: 0,
      bottom: 0,
      width,
      height: '100%',
      padding: token.paddingLG,
      backgroundColor: token.colorBgElevated,
      zIndex: token.zIndexPopupBase + token.zIndexBase + 1,
      ...toShadowStyle(token.boxShadow),
    },
    backDrawer: {
      zIndex: token.zIndexBase,
    },
    backOverlay: {
      zIndex: token.zIndexBase,
    },
    backMask: {
      backgroundColor: token.colorBgMask,
      opacity: 0,
    },
    frontScene: {
      zIndex: token.zIndexBase,
    },
    slideScene: {
      zIndex: token.zIndexBase,
    },
    backScene: {
      zIndex: token.zIndexPopupBase + token.zIndexBase + 1,
    },
    mask: {
      ...StyleSheet.absoluteFill,
      backgroundColor: token.colorBgMask,
    },
  }),
);
