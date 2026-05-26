import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { InputStatus } from '../../Input';
import type { DisplayInputDisplay } from '../types';

interface DisplayInputStyleOptions {
  display: DisplayInputDisplay;
  size: ComponentSize;
  status: InputStatus;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

type StatusColorSelector = (token: AliasToken) => string;

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingXS,
    paddingVertical: token => token.paddingXXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.paddingXS,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.padding,
    paddingVertical: token => token.paddingSM,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

const STATUS_BORDER_COLOR_MAP: Record<InputStatus, StatusColorSelector> = {
  default: token => token.colorBorder,
  error: token => token.colorErrorBorder,
  warning: token => token.colorWarningBorder,
  success: token => token.colorSuccessBorder,
};

export const useStyles = createUseSheetStyle(
  (token, { display, size, status }: DisplayInputStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        alignSelf: display === 'inline' ? 'flex-start' : 'stretch',
        maxWidth: '100%',
        overflow: 'hidden',
        gap: token.sizeXXS,
      },
      labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: token.sizeXXS,
      },
      label: {
        color: token.colorTextLabel,
      },
      requiredMark: {
        color: token.colorErrorText,
      },
      field: {
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        borderWidth: token.lineWidth,
        borderRadius: token.borderRadius,
        borderColor: STATUS_BORDER_COLOR_MAP[status](token),
        backgroundColor: token.colorBgContainer,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      fieldPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      fieldDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      prefix: {
        flexShrink: 0,
      },
      suffix: {
        flexShrink: 0,
      },
      value: {
        flexGrow: display === 'inline' ? 0 : 1,
        flexShrink: 1,
        minWidth: 0,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorText,
      },
      valueContainer: {
        flexGrow: display === 'inline' ? 0 : 1,
        flexShrink: 1,
        minWidth: 0,
      },
      valueContainerHidden: {
        overflow: 'hidden',
      },
      valueContainerVisible: {
        overflow: 'visible',
      },
      valueDisabled: {
        color: token.colorTextDisabled,
      },
      placeholder: {
        color: token.colorTextPlaceholder,
      },
      helper: {
        color: token.colorTextDescription,
      },
      error: {
        color: token.colorErrorText,
      },
    };
  },
);
