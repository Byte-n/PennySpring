import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { ComponentSize } from '../../shares/types';

interface IndexBarStyleOptions {
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  sidebarPaddingVertical: (token: AliasToken) => number;
  sidebarGap: (token: AliasToken) => number;
  indexItemSize: (token: AliasToken) => number;
  indexTextFontSize: (token: AliasToken) => number;
  indexTextLineHeight: (token: AliasToken) => number;
  panelGap: (token: AliasToken) => number;
  panelTitlePaddingVertical: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    sidebarPaddingVertical: token => token.paddingSM / 2,
    sidebarGap: token => token.marginXXS,
    indexItemSize: token => token.controlHeightSM,
    indexTextFontSize: token => token.fontSizeSM,
    indexTextLineHeight: token => token.lineHeightSM,
    panelGap: token => token.marginSM,
    panelTitlePaddingVertical: token => token.paddingXS / 2,
  },
  normal: {
    sidebarPaddingVertical: token => token.paddingMD / 2,
    sidebarGap: token => token.marginXXS,
    indexItemSize: token => token.controlHeight,
    indexTextFontSize: token => token.fontSize,
    indexTextLineHeight: token => token.lineHeight,
    panelGap: token => token.marginMD,
    panelTitlePaddingVertical: token => token.paddingSM / 2,
  },
  large: {
    sidebarPaddingVertical: token => token.paddingLG / 2,
    sidebarGap: token => token.marginXS,
    indexItemSize: token => token.controlHeightLG,
    indexTextFontSize: token => token.fontSizeLG,
    indexTextLineHeight: token => token.lineHeightLG,
    panelGap: token => token.marginLG,
    panelTitlePaddingVertical: token => token.paddingMD / 2,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { disabled, size }: IndexBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const indexItemSize = sizeConfig.indexItemSize(token);

    return {
      root: {
        flexDirection: 'row',
        alignItems: 'stretch',
      },
      content: {
        flex: 1,
        minWidth: 0,
        paddingRight: token.paddingSM,
      },
      panel: {
        marginBottom: sizeConfig.panelGap(token),
        backgroundColor: token.colorBgContainer,
      },
      panelTitleContainer: {
        paddingHorizontal: token.paddingMD,
        paddingVertical: sizeConfig.panelTitlePaddingVertical(token),
        backgroundColor: token.colorBgContainer,
      },
      panelTitleText: {
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
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
      indexText: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.indexTextFontSize(token),
        lineHeight: sizeConfig.indexTextLineHeight(token),
        color: disabled ? token.colorTextDisabled : token.colorTextSecondary,
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
      },
      indexTextActive: {
        color: token.colorPrimary,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      indexTextDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);
