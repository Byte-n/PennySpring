import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { SideBarLayout } from '../types';

export interface SideBarStyleOptions {
  block: boolean;
  disabled: boolean;
  layout: SideBarLayout;
  size: ComponentSize;
}

interface SizeStyleConfig {
  sideBarMinHeight: (token: AliasToken) => number;
  sideBarPaddingHorizontal: (token: AliasToken) => number;
  sideBarPaddingVertical: (token: AliasToken) => number;
  sideBarGap: (token: AliasToken) => number;
  panelPaddingTop: (token: AliasToken) => number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    sideBarMinHeight: token => token.controlHeightSM,
    sideBarPaddingHorizontal: token => token.controlPaddingHorizontalSM,
    sideBarPaddingVertical: token => token.controlPaddingHorizontalSM / 2,
    sideBarGap: token => token.marginXXS,
    panelPaddingTop: token => token.paddingSM / 2,
  },
  normal: {
    sideBarMinHeight: token => token.controlHeight,
    sideBarPaddingHorizontal: token => token.controlPaddingHorizontal,
    sideBarPaddingVertical: token => token.controlPaddingHorizontal / 2,
    sideBarGap: token => token.marginXS,
    panelPaddingTop: token => token.paddingMD / 2,
  },
  large: {
    sideBarMinHeight: token => token.controlHeightLG,
    sideBarPaddingHorizontal: token => token.paddingMD,
    sideBarPaddingVertical: token => token.paddingMD / 2,
    sideBarGap: token => token.marginSM,
    panelPaddingTop: token => token.paddingLG / 2,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { block, disabled, layout, size }: SideBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      sideBarList: {
        flexDirection: 'row',
        flexWrap: layout === 'wrap' ? 'wrap' : 'nowrap',
        alignItems: 'center',
        borderBottomWidth: token.lineWidth,
        borderBottomColor: disabled
          ? token.colorBorderDisabled
          : token.colorBorderSecondary,
        gap: sizeConfig.sideBarGap(token),
        minWidth: block ? '100%' : undefined,
      },
      sideBar: {
        minHeight: sizeConfig.sideBarMinHeight(token),
        paddingHorizontal: sizeConfig.sideBarPaddingHorizontal(token),
        paddingVertical: sizeConfig.sideBarPaddingVertical(token),
        borderBottomWidth: token.lineWidthBold,
        borderBottomColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      sideBarBlock: {
        maxWidth: '100%',
      },
      sideBarPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      sideBarActive: {
        borderBottomColor: token.colorPrimary,
      },
      sideBarDisabled: {
        opacity: token.opacityLoading,
      },
      panel: {
        paddingTop: sizeConfig.panelPaddingTop(token),
      },
    };
  },
);
