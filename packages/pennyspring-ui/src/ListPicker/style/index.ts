import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface ListPickerStyleOptions {
  size: ComponentSize;
}

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  optionPaddingVertical: (token: AliasToken) => number;
  panelGap: (token: AliasToken) => number;
}

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    fontSize: token => token.fontSizeSM,
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.marginXXS,
    optionPaddingVertical: token => token.controlPaddingHorizontalSM / 2,
    panelGap: token => token.paddingSM,
  },
  normal: {
    fontSize: token => token.fontSize,
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.marginXS,
    optionPaddingVertical: token => token.controlPaddingHorizontal / 2,
    panelGap: token => token.paddingMD,
  },
  large: {
    fontSize: token => token.fontSizeLG,
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    gap: token => token.marginSM,
    optionPaddingVertical: token => token.paddingMD / 2,
    panelGap: token => token.paddingLG,
  },
};

const POPUP_MAX_HEIGHT = '100%';

export const useListPickerStyles = createUseSheetStyle(
  (token, { size }: ListPickerStyleOptions) => {
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
        padding: 0,
        maxHeight: POPUP_MAX_HEIGHT,
      },
      popupContent: {
        flex: 1,
        minHeight: 0,
        gap: token.marginSM / 2,
      },
      popupRoot: {
        flex: 1,
        minHeight: 0,
      },
      floatingPanelContent: {
        flex: 1,
        minHeight: 0,
        paddingInline: token.paddingSM,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: token.marginSM,
      },
      headerActions: {
        alignItems: 'center',
        gap: token.marginXS,
      },
      headerText: {
      },
      list: {
        flex: 1,
        minHeight: 0,
        gap: token.marginXS / 2,
      },
      panelBody: {
        flex: 1,
        minHeight: 0,
        paddingHorizontal: 0,
        paddingTop: 0,
        paddingBottom: 0,
      },
      group: {
        gap: token.marginXXS / 2,
      },
      groupTitle: {
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
      cascaderPanel: {
        flex: 1,
        minHeight: 0,
        gap: sizeConfig.panelGap(token) / 2,
      },
      cascaderList: {
        flex: 1,
        minHeight: 0,
      },
      cascaderListContent: {
        gap: token.marginXXS / 2,
      },
      cascaderEmpty: {
        minHeight: sizeConfig.minHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.panelGap(token),
        paddingVertical: sizeConfig.panelGap(token) / 2,
      },
      cascaderLoading: {
        minHeight: sizeConfig.minHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.panelGap(token),
        paddingVertical: sizeConfig.panelGap(token) / 2,
      },
      cascaderFloatingPanelContent: {
        paddingHorizontal: sizeConfig.panelGap(token),
        paddingVertical: sizeConfig.panelGap(token) / 2,
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
      },
      footerPrimaryButtonText: {
      },
    };
  },
);
