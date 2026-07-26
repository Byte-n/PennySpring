import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { DisplayInputDisplay } from '../types';

interface DisplayInputStyleOptions {
  disabled: boolean;
  display: DisplayInputDisplay;
  isError: boolean;
  size: ComponentSize;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.paddingXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG + token.paddingSM,
    paddingHorizontal: token => token.padding,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { disabled, display, isError, size }: DisplayInputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];
    const underlineColor = isError ? token.colorError : token.colorBorder;

    return {
      root: {
        alignSelf: display === 'inline' ? 'flex-start' : 'stretch',
        flexShrink: display === 'inline' ? 1 : 0,
        maxWidth: '100%',
        overflow: 'hidden',
        gap: token.marginXXS,
      },
      labelRow: {
        gap: token.marginXXS,
      },
      label: {
      },
      requiredMark: {
      },
      field: {
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorFillTertiary,
        borderTopLeftRadius: token.borderRadiusSM,
        borderTopRightRadius: token.borderRadiusSM,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap(token),
        overflow: 'hidden',
        position: 'relative',
      },
      fieldContent: {
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      fieldPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      fieldDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
      },
      underline: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: token.lineWidthBold,
        backgroundColor: disabled ? token.colorBorderDisabled : underlineColor,
      },
      prefix: {
        flexShrink: 0,
      },
      suffix: {
        flexShrink: 0,
      },
      valueWrapper: {
        flex: display === 'inline' ? 0 : 1,
        flexShrink: display === 'inline' ? 1 : 0,
        minWidth: 0,
        minHeight: sizeConfig.minHeight(token),
        justifyContent: 'flex-end',
        position: 'relative',
      },
      floatingLabelContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: token.zIndexBase,
      },
      floatingLabel: {
        color: isError ? token.colorError : token.colorTextPlaceholder,
        fontFamily: token.fontFamily,
      },
      labelWidthPlaceholder: {
        height: 0,
        overflow: 'visible',
        opacity: 0,
      },
      value: {
        fontFamily: token.fontFamily,
      },
      valueWithLabel: {
        paddingTop: token.padding + token.paddingXS,
        paddingBottom: 0,
      },
      valueWithoutLabel: {
        paddingTop: token.paddingXS,
        paddingBottom: 0,
      },
      valueContainer: {
      },
      valueContainerHidden: {
        overflow: 'hidden',
      },
      valueContainerVisible: {
        overflow: 'visible',
      },
      valueDisabled: {
      },
      helper: {
      },
      error: {
      },
    };
  },
);
