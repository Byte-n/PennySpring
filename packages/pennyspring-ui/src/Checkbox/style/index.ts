import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { CheckboxDisplayType } from '../types';

const TRANSPARENT = 'transparent';

interface CheckboxStyleOptions {
  block: boolean;
  direction: 'horizontal' | 'vertical';
  displayType: CheckboxDisplayType;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  indicatorSize: (token: AliasToken) => number;
  markSize: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    indicatorSize: token => token.fontSizeSM,
    markSize: token => token.sizeXXS,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXXS,
  },
  normal: {
    minHeight: token => token.controlHeight,
    indicatorSize: token => token.fontSize,
    markSize: token => token.sizeXS,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.sizeXS,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    indicatorSize: token => token.fontSizeXL,
    markSize: token => token.sizeSM,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    gap: token => token.sizeXS,
  },
};

export const useStyles = createUseSheetStyle(
  (
    token,
    { block, direction, displayType, size }: CheckboxStyleOptions,
  ) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const isButton = displayType === 'button';

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      groupRoot: {
        alignSelf: block ? 'stretch' : 'flex-start',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        flexWrap: direction === 'horizontal' ? 'wrap' : undefined,
        gap: sizeConfig.gap(token),
        width: block ? '100%' : undefined,
      },
      control: {
        alignItems: 'center',
        alignSelf: block ? 'stretch' : 'flex-start',
        backgroundColor: isButton ? token.colorBgContainer : TRANSPARENT,
        borderColor: isButton ? token.colorBorder : TRANSPARENT,
        borderRadius: token.borderRadius,
        borderWidth: token.lineWidth,
        flex: block && isButton ? 1 : undefined,
        flexDirection: 'row',
        justifyContent: isButton ? 'center' : 'flex-start',
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: isButton ? sizeConfig.paddingHorizontal(token) : 0,
        paddingVertical: isButton ? sizeConfig.paddingVertical(token) : 0,
      },
      controlChecked: {
        backgroundColor: isButton ? token.colorPrimaryBg : TRANSPARENT,
        borderColor: isButton ? token.colorPrimaryBorder : TRANSPARENT,
      },
      controlPressed: {
        backgroundColor: isButton
          ? token.controlItemBgActive
          : token.colorBgTextActive,
      },
      controlDisabled: {
        backgroundColor: isButton ? token.colorBgContainerDisabled : TRANSPARENT,
        borderColor: isButton ? token.colorBorderDisabled : TRANSPARENT,
      },
      content: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: sizeConfig.gap(token),
        justifyContent: isButton ? 'center' : 'flex-start',
      },
      indicator: {
        alignItems: 'center',
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorBorder,
        borderRadius: token.borderRadiusXS,
        borderWidth: token.lineWidth,
        height: sizeConfig.indicatorSize(token),
        justifyContent: 'center',
        width: sizeConfig.indicatorSize(token),
      },
      indicatorChecked: {
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary,
      },
      indicatorDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorderDisabled,
      },
      indicatorReadonly: {
        borderColor: token.colorBorderSecondary,
      },
      mark: {
        backgroundColor: token.colorTextLightSolid,
        borderRadius: token.borderRadiusXS,
        height: sizeConfig.markSize(token),
        width: sizeConfig.markSize(token),
      },
      markIndeterminate: {
        height: token.lineWidthBold,
        width: sizeConfig.markSize(token),
      },
      label: {
        fontFamily: token.fontFamily,
      },
      labelChecked: {
        color: isButton ? token.colorPrimaryText : token.colorText,
      },
      labelDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);
