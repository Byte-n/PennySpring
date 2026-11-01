import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { ComponentSize } from '../../shares/types';
import type { ToastPlacement } from '../types';

interface ToastSizeConfig {
  gap: (token: AliasToken) => number;
  horizontalPadding: (token: AliasToken) => number;
  iconSize: number;
  minHeight: number;
  textSize: 'xs' | 'sm' | 'md';
  verticalPadding: (token: AliasToken) => number;
}

/** 胶囊圆角与 34 / 40 / 46 高度在 AliasToken 中没有档位，按设计稿落为语义常量。 */
const PILL_RADIUS = 999;
const DOT_SIZE = 6;

export const SIZE_TOKEN_MAP: Record<ComponentSize, ToastSizeConfig> = {
  small: {
    gap: token => token.marginXXS,
    horizontalPadding: token => token.paddingSM,
    iconSize: 14,
    minHeight: 34,
    textSize: 'xs',
    verticalPadding: token => token.marginXS,
  },
  normal: {
    gap: token => token.marginXS,
    horizontalPadding: token => token.padding,
    iconSize: 16,
    minHeight: 40,
    textSize: 'sm',
    verticalPadding: token => token.marginXS,
  },
  large: {
    gap: token => token.marginSM,
    horizontalPadding: token => token.paddingMD,
    iconSize: 18,
    minHeight: 46,
    textSize: 'md',
    verticalPadding: token => token.marginSM,
  },
};

interface ToastStyleOptions {
  maxWidth: number;
  placement: ToastPlacement;
  safeAreaBottom: number;
  safeAreaTop: number;
  size: ComponentSize;
}

function getPlacementStyle(
  token: AliasToken,
  placement: ToastPlacement,
  safeAreaTop: number,
  safeAreaBottom: number,
): ViewStyle {
  if (placement === 'top') {
    return { top: safeAreaTop + token.paddingXL };
  }

  if (placement === 'bottom') {
    return { bottom: safeAreaBottom + token.paddingXL };
  }

  return { top: '50%' };
}

export const useStyles = createUseSheetStyle(
  (
    token,
    {
      maxWidth,
      placement,
      safeAreaBottom,
      safeAreaTop,
      size,
    }: ToastStyleOptions,
  ) => {
    const sizeConfig = SIZE_TOKEN_MAP[size];

    return {
      content: {
        position: 'absolute',
        zIndex: token.zIndexPopupBase + 100,
        maxWidth,
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: PILL_RADIUS,
        backgroundColor: token.colorBgSpotlight,
        minHeight: sizeConfig.minHeight,
        paddingHorizontal: sizeConfig.horizontalPadding(token),
        paddingVertical: sizeConfig.verticalPadding(token),
        ...getPlacementStyle(token, placement, safeAreaTop, safeAreaBottom),
      },
      row: {
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      messageText: {
        color: token.colorTextLightSolid,
        flexShrink: 1,
      },
      dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: PILL_RADIUS,
        backgroundColor: token.colorTextLightSolid,
        opacity: 0.7,
      },
    };
  },
);
