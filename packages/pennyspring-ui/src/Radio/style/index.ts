import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { RadioDisplayType } from '../types';

const TRANSPARENT = 'transparent';

interface RadioStyleOptions {
  block: boolean;
  displayType: RadioDisplayType;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  controlSize: (token: AliasToken) => number;
  indicatorSize: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    controlSize: token => token.fontSize,
    indicatorSize: token => token.sizeXXS,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXXS,
  },
  normal: {
    minHeight: token => token.controlHeight,
    controlSize: token => token.fontSizeLG,
    indicatorSize: token => token.sizeXS,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.sizeXS,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    controlSize: token => token.fontSizeXL,
    indicatorSize: token => token.sizeSM,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    gap: token => token.sizeXS,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { block, displayType, size }: RadioStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const controlSize = sizeConfig.controlSize(token);

    return {
      groupRoot: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      option: {
        minHeight: sizeConfig.minHeight(token),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: sizeConfig.gap(token),
      },
      optionButton: {
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        borderWidth: token.lineWidth,
        borderColor: token.colorBorder,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      },
      optionButtonBlock: {
        flex: 1,
      },
      optionButtonSelected: {
        borderColor: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      optionPressed: {
        backgroundColor:
          displayType === 'button'
            ? token.controlItemBgActive
            : token.colorBgTextActive,
      },
      optionDisabled: {
        backgroundColor:
          displayType === 'button'
            ? token.colorBgContainerDisabled
            : TRANSPARENT,
        borderColor:
          displayType === 'button' ? token.colorBorderDisabled : undefined,
      },
      control: {
        width: controlSize,
        height: controlSize,
        borderRadius: controlSize,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorder,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: token.colorBgContainer,
      },
      controlSelected: {
        borderColor: token.colorPrimary,
      },
      controlDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      indicator: {
        width: sizeConfig.indicatorSize(token),
        height: sizeConfig.indicatorSize(token),
        borderRadius: sizeConfig.indicatorSize(token),
        backgroundColor: token.colorPrimary,
      },
      indicatorDisabled: {
        backgroundColor: token.colorTextDisabled,
      },
      content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: displayType === 'button' ? 'center' : 'flex-start',
      },
      label: {
        fontFamily: token.fontFamily,
      },
      labelSelected: {
        color: token.colorPrimaryText,
      },
      labelDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);
