import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { ImageRadius } from '../types';

const CIRCLE_RADIUS = 999;

interface ImageStyleOptions {
  radius: ImageRadius;
}

function resolveRadius(radius: ImageRadius, token: AliasToken): number {
  if (radius === 'none') {
    return 0;
  }

  if (radius === 'small') {
    return token.borderRadiusSM;
  }

  if (radius === 'large') {
    return token.borderRadiusLG;
  }

  if (radius === 'circle') {
    return CIRCLE_RADIUS;
  }

  return token.borderRadius;
}

export const useStyles = createUseSheetStyle<ImageStyleOptions>((token, { radius }) => ({
  root: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: resolveRadius(radius, token),
    backgroundColor: token.colorFillQuaternary,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  error: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.marginXXS,
    backgroundColor: token.colorFillQuaternary,
  },
  errorText: {
    color: token.colorTextTertiary,
  },
}));

interface PreviewStyleOptions {
  pageHeight: number;
  pageWidth: number;
  topInset: number;
}

export const usePreviewStyles = createUseSheetStyle<PreviewStyleOptions>(
  (token, { pageHeight, pageWidth, topInset }) => ({
    popupBody: {
      width: '100%',
      height: '100%',
      padding: 0,
      borderRadius: 0,
      backgroundColor: token.colorBgSolid,
    },
    overlay: {
      flex: 1,
      backgroundColor: token.colorBgSolid,
    },
    scroll: {
      flex: 1,
    },
    page: {
      width: pageWidth,
      height: pageHeight,
      overflow: 'hidden',
    },
    topBar: {
      position: 'absolute',
      top: topInset + token.paddingXS,
      left: token.padding,
      right: token.padding,
      zIndex: token.zIndexBase + 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    closeButton: {
      width: token.controlHeight,
      height: token.controlHeight,
      borderRadius: CIRCLE_RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token.colorBgSpotlight,
    },
    countPill: {
      height: token.sizeLG,
      paddingHorizontal: token.paddingXS,
      borderRadius: CIRCLE_RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: token.colorBgSpotlight,
    },
    countText: {
      color: token.colorTextLightSolid,
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      fontVariant: ['tabular-nums'],
    },
    stage: {
      flex: 1,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loading: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    error: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: token.marginXS,
      paddingHorizontal: token.paddingLG,
    },
    errorText: {
      color: token.colorTextLightSolid,
      textAlign: 'center',
    },
    errorHint: {
      color: token.colorTextLightSolid,
      opacity: token.opacityLoading,
      textAlign: 'center',
    } as TextStyle,
  }),
);

export const usePageStyles = createUseSheetStyle(token => ({
  root: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  translate: {
    width: '100%',
    height: '100%',
  },
  scale: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loading: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.marginXS,
    paddingHorizontal: token.paddingLG,
    backgroundColor: token.colorBgSolid,
  },
  errorText: {
    color: token.colorTextLightSolid,
    textAlign: 'center',
  },
  errorHint: {
    color: token.colorTextLightSolid,
    opacity: token.opacityLoading,
    textAlign: 'center',
  } as TextStyle,
}));
