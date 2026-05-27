import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface SelectionListStyleOptions {
  size: ComponentSize;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  optionPaddingVertical: (token: AliasToken) => number;
}

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    fontSize: token => token.fontSizeSM,
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.marginXXS,
    optionPaddingVertical: token => token.controlPaddingHorizontalSM / 2,
  },
  normal: {
    fontSize: token => token.fontSize,
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.marginXS,
    optionPaddingVertical: token => token.controlPaddingHorizontal / 2,
  },
  large: {
    fontSize: token => token.fontSizeLG,
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    gap: token => token.marginSM,
    optionPaddingVertical: token => token.paddingMD / 2,
  },
};

const POPUP_MAX_HEIGHT = '85%';

export const useSelectionListStyles = createUseSheetStyle(
  (token, { size }: SelectionListStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
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
        maxHeight: POPUP_MAX_HEIGHT,
      },
      popupContent: {
        gap: token.marginSM / 2,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: token.marginSM,
      },
      headerText: {
        color: token.colorTextHeading,
      },
      fieldActive: {
        borderColor: token.colorPrimary,
      },
      list: {
        gap: token.marginXS / 2,
      },
      group: {
        gap: token.marginXXS / 2,
      },
      groupTitle: {
        color: token.colorTextDescription,
      },
      option: {
        minHeight: sizeConfig.minHeight(token),
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
        gap: token.marginXXS / 2,
      },
      optionDescription: {
        color: token.colorTextDescription,
      },
      optionMeta: {
        flexShrink: 0,
      },
      optionDivider: {
        height: token.lineWidth,
        backgroundColor: token.colorSplit,
      },
      empty: {
        paddingVertical: token.paddingMD / 2,
        alignItems: 'center',
      },
      loading: {
        paddingVertical: token.paddingMD / 2,
        alignItems: 'center',
      },
      footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: token.marginXS,
      },
      footerButton: {
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
    };
  },
);
