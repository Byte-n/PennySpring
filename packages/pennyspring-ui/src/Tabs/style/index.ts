import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface TabsStyleOptions {
  block: boolean;
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  tabHeight: number;
  tabPaddingHorizontal: (token: AliasToken) => number;
  hitSlopVertical: number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    tabHeight: 32,
    tabPaddingHorizontal: token => token.paddingXS,
    hitSlopVertical: 6,
  },
  normal: {
    tabHeight: 40,
    tabPaddingHorizontal: token => token.paddingSM,
    hitSlopVertical: 2,
  },
  large: {
    tabHeight: 48,
    tabPaddingHorizontal: token => token.paddingSM,
    hitSlopVertical: 0,
  },
};

/** 行高低于 44 时用 hitSlop 垂直补足触达，左右不补以免相邻 tab 命中区重叠。 */
export function getTabHitSlop(size: ComponentSize) {
  const { hitSlopVertical } = SIZE_STYLE_MAP[size];

  if (hitSlopVertical === 0) {
    return undefined;
  }

  return { top: hitSlopVertical, bottom: hitSlopVertical };
}

export const useStyles = createUseSheetStyle(
  (token, { block, size }: TabsStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        backgroundColor: token.colorBgContainer,
        width: block ? '100%' : undefined,
      },
      tabList: {
        alignItems: 'center',
        borderBottomColor: token.colorSplit,
        borderBottomWidth: token.lineWidth,
        minWidth: block ? '100%' : undefined,
        rowGap: token.sizeXXS,
      },
      scrollList: {
        flexGrow: 0,
      },
      tab: {
        alignItems: 'center',
        borderRadius: token.borderRadius,
        flexShrink: 0,
        height: sizeConfig.tabHeight,
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.tabPaddingHorizontal(token),
        position: 'relative',
      },
      tabBlock: {
        flexBasis: 'auto',
        flexGrow: 1,
      },
      tabPressed: {
        backgroundColor: token.colorFillTertiary,
      },
      underline: {
        backgroundColor: token.colorPrimary,
        borderRadius: token.borderRadiusXS,
        bottom: -token.lineWidth,
        height: token.lineWidthBold,
        left: sizeConfig.tabPaddingHorizontal(token),
        position: 'absolute',
        right: sizeConfig.tabPaddingHorizontal(token),
      },
      label: {
        fontFamily: token.fontFamily,
      },
      panel: {
        paddingTop: token.padding,
      },
    };
  },
);
