import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface TabBarStyleOptions {
  disabled: boolean;
  safeAreaInsetBottom: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  iconBottomGap: (token: AliasToken) => number;
  titleFontSize: (token: AliasToken) => number;
  titleLineHeight: (token: AliasToken) => number;
  badgeHeight: (token: AliasToken) => number;
  badgeMinWidth: (token: AliasToken) => number;
  badgePaddingHorizontal: (token: AliasToken) => number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM + token.paddingSM,
    iconBottomGap: token => token.marginXXS,
    titleFontSize: token => token.fontSizeSM,
    titleLineHeight: token => token.lineHeightSM,
    badgeHeight: token => token.controlHeightXS,
    badgeMinWidth: token => token.controlHeightXS,
    badgePaddingHorizontal: token => token.paddingXXS,
  },
  normal: {
    minHeight: token => token.controlHeight + token.paddingSM,
    iconBottomGap: token => token.marginXS,
    titleFontSize: token => token.fontSizeSM,
    titleLineHeight: token => token.lineHeightSM,
    badgeHeight: token => token.controlHeightXS,
    badgeMinWidth: token => token.controlHeightXS,
    badgePaddingHorizontal: token => token.paddingXXS,
  },
  large: {
    minHeight: token => token.controlHeightLG + token.paddingSM,
    iconBottomGap: token => token.marginSM,
    titleFontSize: token => token.fontSize,
    titleLineHeight: token => token.lineHeight,
    badgeHeight: token => token.controlHeightSM,
    badgeMinWidth: token => token.controlHeightSM,
    badgePaddingHorizontal: token => token.paddingXS,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { disabled, safeAreaInsetBottom, size }: TabBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        backgroundColor: token.colorBgContainer,
        borderTopWidth: token.lineWidth,
        borderTopColor: disabled
          ? token.colorBorderDisabled
          : token.colorBorderSecondary,
        paddingTop: token.paddingXXS / 2,
        paddingBottom: safeAreaInsetBottom ? token.paddingSM / 2 : token.paddingXXS / 2,
      },
      tab: {
        flex: 1,
        minHeight: sizeConfig.minHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: token.paddingXXS,
        paddingVertical: token.paddingXXS / 2,
      },
      tabPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      tabActive: {
        backgroundColor: token.controlItemBgActive,
      },
      tabDisabled: {
        opacity: token.opacityLoading,
      },
      iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: sizeConfig.iconBottomGap(token),
      },
      hitSlop: {
        top: token.marginXXS,
        right: token.marginXXS,
        bottom: token.marginXXS,
        left: token.marginXXS,
      },
      badge: {
        position: 'absolute',
        top: token.paddingXXS,
        right: token.paddingSM,
        minWidth: sizeConfig.badgeMinWidth(token),
        height: sizeConfig.badgeHeight(token),
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorError,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.badgePaddingHorizontal(token),
      },
    };
  },
);
