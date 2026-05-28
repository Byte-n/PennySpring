import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface IndexBarStyleOptions {
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  sidebarPaddingVertical: (token: AliasToken) => number;
  sidebarGap: (token: AliasToken) => number;
  indexItemSize: (token: AliasToken) => number;
  panelTitlePaddingVertical: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    sidebarPaddingVertical: token => token.paddingSM / 2,
    sidebarGap: token => token.marginXXS,
    indexItemSize: token => token.controlHeightSM,
    panelTitlePaddingVertical: token => token.paddingXS / 2,
  },
  normal: {
    sidebarPaddingVertical: token => token.paddingMD / 2,
    sidebarGap: token => token.marginXXS,
    indexItemSize: token => token.controlHeight,
    panelTitlePaddingVertical: token => token.paddingSM / 2,
  },
  large: {
    sidebarPaddingVertical: token => token.paddingLG / 2,
    sidebarGap: token => token.marginXS,
    indexItemSize: token => token.controlHeightLG,
    panelTitlePaddingVertical: token => token.paddingMD / 2,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { disabled: _disabled, size }: IndexBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const indexItemSize = sizeConfig.indexItemSize(token);

    return {
      root: {
        alignItems: 'stretch',
      },
      content: {
        flex: 1,
        minWidth: 0,
        paddingRight: token.paddingSM,
      },
      panelList: {
        paddingVertical: token.paddingXXS,
      },
      panel: {
        backgroundColor: token.colorBgContainer,
      },
      panelTitleContainer: {
        paddingHorizontal: token.paddingMD,
        paddingVertical: sizeConfig.panelTitlePaddingVertical(token),
        backgroundColor: token.colorBgContainer,
      },
      panelTitleText: {},
      sidebar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: sizeConfig.sidebarPaddingVertical(token),
        gap: sizeConfig.sidebarGap(token),
      },
      indexItem: {
        minWidth: indexItemSize,
        minHeight: indexItemSize,
        borderRadius: token.borderRadiusSM,
        paddingHorizontal: token.paddingXXS,
        alignItems: 'center',
        justifyContent: 'center',
      },
      indexItemPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      indexItemActive: {
        backgroundColor: token.controlItemBgActive,
      },
      indexItemDisabled: {
        opacity: token.opacityLoading,
      },
      indexText: {},
      indexTextActive: {},
      indexTextDisabled: {},
    };
  },
);
