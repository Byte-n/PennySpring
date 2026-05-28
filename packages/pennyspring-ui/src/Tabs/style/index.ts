import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface TabsStyleOptions {
  block: boolean;
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  tabMinHeight: (token: AliasToken) => number;
  tabPaddingHorizontal: (token: AliasToken) => number;
  tabPaddingVertical: (token: AliasToken) => number;
  tabGap: (token: AliasToken) => number;
  panelPaddingTop: (token: AliasToken) => number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    tabMinHeight: token => token.controlHeightSM,
    tabPaddingHorizontal: token => token.controlPaddingHorizontalSM,
    tabPaddingVertical: token => token.controlPaddingHorizontalSM / 2,
    tabGap: token => token.marginXXS,
    panelPaddingTop: token => token.paddingSM / 2,
  },
  normal: {
    tabMinHeight: token => token.controlHeight,
    tabPaddingHorizontal: token => token.controlPaddingHorizontal,
    tabPaddingVertical: token => token.controlPaddingHorizontal / 2,
    tabGap: token => token.marginXS,
    panelPaddingTop: token => token.paddingMD / 2,
  },
  large: {
    tabMinHeight: token => token.controlHeightLG,
    tabPaddingHorizontal: token => token.paddingMD,
    tabPaddingVertical: token => token.paddingMD / 2,
    tabGap: token => token.marginSM,
    panelPaddingTop: token => token.paddingLG / 2,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { block, disabled, size }: TabsStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      tabList: {
        alignItems: 'center',
        borderBottomWidth: token.lineWidth,
        borderBottomColor: disabled
          ? token.colorBorderDisabled
          : token.colorBorderSecondary,
        gap: sizeConfig.tabGap(token),
        minWidth: block ? '100%' : undefined,
      },
      scrollList: {
        flexGrow: 0,
      },
      tab: {
        minHeight: sizeConfig.tabMinHeight(token),
        paddingHorizontal: sizeConfig.tabPaddingHorizontal(token),
        paddingVertical: sizeConfig.tabPaddingVertical(token),
        borderBottomWidth: token.lineWidthBold,
        borderBottomColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      tabBlock: {
        maxWidth: '100%',
      },
      tabPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      tabActive: {
        borderBottomColor: token.colorPrimary,
      },
      tabDisabled: {
        opacity: token.opacityLoading,
      },
      label: {
        fontFamily: token.fontFamily,
      },
      panel: {
        paddingTop: sizeConfig.panelPaddingTop(token),
      },
    };
  },
);
