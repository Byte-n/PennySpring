import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../shares/types';
import type { SelectionListStatus } from './types';

interface SelectionListStyleOptions {
  size: ComponentSize;
  status: SelectionListStatus;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
  optionPaddingVertical: (token: AliasToken) => number;
}

type StatusColorSelector = (token: AliasToken) => string;

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.paddingXXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
    optionPaddingVertical: token => token.paddingXS,
  },
  normal: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.paddingXS,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
    optionPaddingVertical: token => token.paddingSM,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingSM,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
    optionPaddingVertical: token => token.paddingMD,
  },
};

const STATUS_BORDER_COLOR_MAP: Record<SelectionListStatus, StatusColorSelector> = {
  default: token => token.colorBorder,
  error: token => token.colorErrorBorder,
  warning: token => token.colorWarningBorder,
  success: token => token.colorSuccessBorder,
};

export const useSelectionListStyles = createUseSheetStyle(
  (token, { size, status }: SelectionListStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        gap: token.sizeXXS,
      },
      label: {
        color: token.colorTextLabel,
      },
      trigger: {
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
      triggerPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      triggerOpen: {
        borderColor: token.colorPrimary,
      },
      triggerError: {
        borderColor: token.colorError,
      },
      triggerDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      valueArea: {
        flex: 1,
        minWidth: 0,
      },
      valueText: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorText,
      },
      placeholder: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorTextPlaceholder,
      },
      suffix: {
        color: token.colorIcon,
        fontSize: sizeConfig.fontSize(token),
      },
      marker: {
        minHeight: sizeConfig.fontSize(token),
        minWidth: sizeConfig.fontSize(token),
        alignItems: 'center',
        justifyContent: 'center',
      },
      markerIcon: {
        color: token.colorPrimaryText,
        fontSize: sizeConfig.fontSize(token),
      },
      popup: {
        padding: token.paddingSM,
        maxHeight: '85%',
      },
      popupContent: {
        gap: token.sizeSM,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: token.sizeSM,
      },
      headerText: {
        color: token.colorTextHeading,
      },
      search: {
        minHeight: token.controlHeightSM,
        paddingHorizontal: token.controlPaddingHorizontalSM,
        paddingVertical: token.paddingXXS,
        borderWidth: token.lineWidth,
        borderRadius: token.borderRadiusSM,
        borderColor: token.colorBorder,
        backgroundColor: token.colorBgContainer,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorText,
      },
      list: {
        gap: token.sizeXS,
      },
      group: {
        gap: token.sizeXXS,
      },
      groupTitle: {
        color: token.colorTextDescription,
      },
      option: {
        minHeight: token.controlHeightSM,
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.optionPaddingVertical(token),
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorBgContainer,
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      optionPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      optionSelected: {
        backgroundColor: token.controlItemBgActive,
      },
      optionDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
      },
      markerDisabled: {
        color: token.colorTextDisabled,
      },
      optionContent: {
        flex: 1,
        minWidth: 0,
        gap: token.sizeXXS,
      },
      optionLabel: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorText,
      },
      optionLabelDisabled: {
        color: token.colorTextDisabled,
      },
      optionDescription: {
        color: token.colorTextDescription,
      },
      optionMeta: {
        flexShrink: 0,
      },
      empty: {
        paddingVertical: token.paddingMD,
        alignItems: 'center',
      },
      loading: {
        paddingVertical: token.paddingMD,
        alignItems: 'center',
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: token.sizeXS,
      },
      footerButton: {
        minHeight: token.controlHeightSM,
        paddingHorizontal: token.controlPaddingHorizontal,
        borderRadius: token.borderRadiusSM,
        alignItems: 'center',
        justifyContent: 'center',
      },
      footerButtonPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      footerPrimaryButton: {
        backgroundColor: token.colorPrimary,
      },
      footerButtonText: {
        color: token.colorText,
      },
      footerPrimaryButtonText: {
        color: token.colorTextLightSolid,
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
