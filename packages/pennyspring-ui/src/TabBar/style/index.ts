import { createUseSheetStyle } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface TabBarStyleOptions {
  disabled: boolean;
  safeAreaInsetBottom: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  tabHeight: number;
  iconSize: number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: { tabHeight: 48, iconSize: 20 },
  normal: { tabHeight: 56, iconSize: 24 },
  large: { tabHeight: 64, iconSize: 26 },
};

/** 角标 18 高 / 最小 18、红点 8，以及相对图标中心的偏移量。 */
const BADGE_HEIGHT = 18;
const BADGE_MIN_WIDTH = 18;
const BADGE_TOP = 2;
const BADGE_OFFSET = 14;
const DOT_SIZE = 8;
const DOT_TOP = 8;
const DOT_OFFSET = 10;
const BADGE_RADIUS = 999;

export const useStyles = createUseSheetStyle(
  (token, { safeAreaInsetBottom, size }: TabBarStyleOptions) => {
    const { tabHeight, iconSize } = SIZE_STYLE_MAP[size];

    return {
      root: {
        backgroundColor: token.colorBgContainer,
        borderTopColor: token.colorSplit,
        borderTopWidth: token.lineWidth,
        paddingBottom: safeAreaInsetBottom ? token.sizeXS : token.sizeXXS,
        paddingTop: token.sizeXXS,
      },
      tab: {
        flex: 1,
        height: tabHeight,
        padding: token.sizeXXS,
      },
      pressSurface: {
        alignItems: 'center',
        borderRadius: token.borderRadiusLG,
        flex: 1,
        gap: token.sizeXXS,
        justifyContent: 'center',
      },
      tabPressed: {
        backgroundColor: token.colorFillTertiary,
      },
      iconBox: {
        alignItems: 'center',
        height: iconSize,
        justifyContent: 'center',
        width: iconSize,
      },
      badge: {
        alignItems: 'center',
        backgroundColor: token.colorError,
        borderRadius: BADGE_RADIUS,
        height: BADGE_HEIGHT,
        justifyContent: 'center',
        marginRight: -(iconSize / 2 + BADGE_OFFSET),
        minWidth: BADGE_MIN_WIDTH,
        paddingHorizontal: token.paddingXXS,
        position: 'absolute',
        right: '50%',
        top: BADGE_TOP,
      },
      badgeDot: {
        height: DOT_SIZE,
        marginRight: -(iconSize / 2 + DOT_OFFSET),
        minWidth: DOT_SIZE,
        paddingHorizontal: 0,
        top: DOT_TOP,
        width: DOT_SIZE,
      },
    };
  },
);
