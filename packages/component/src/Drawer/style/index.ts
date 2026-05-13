import type { ViewStyle } from 'react-native';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { DrawerPosition } from '../types';

export interface DrawerStyleOptions {
  position: DrawerPosition;
  width: number | `${number}%`;
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
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundColor: token.colorFillContent,
      opacity: token.opacityLoading,
      zIndex: token.zIndexBase + 1,
    },
    overlay: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
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
      backgroundColor: token.colorFillContent,
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
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      backgroundColor: token.colorFillContent,
      opacity: token.opacityLoading,
    },
  }),
);
