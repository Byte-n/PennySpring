import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface CascaderStyleOptions {
  size: ComponentSize;
}

interface SizeConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
  panelGap: (token: AliasToken) => number;
}

const SIZE_MAP: Record<ComponentSize, SizeConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeightSM,
    panelGap: token => token.paddingSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeight,
    panelGap: token => token.paddingMD,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeXL,
    lineHeight: token => token.lineHeightLG,
    panelGap: token => token.paddingLG,
  },
};

export const CASCADER_DEFAULT_PLACEHOLDER = '请选择';
export const CASCADER_DEFAULT_EMPTY_TEXT = '暂无选项';
export const CASCADER_DEFAULT_TAB_PLACEHOLDER = '请选择';

export const useCascaderStyles = createUseSheetStyle(
  (token, { size }: CascaderStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        gap: sizeConfig.panelGap(token),
      },
      trigger: {
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        borderWidth: token.lineWidth,
        borderRadius: token.borderRadius,
        borderColor: token.colorBorder,
        backgroundColor: token.colorBgContainer,
      },
      triggerRow: {
        alignItems: 'center',
        gap: sizeConfig.gap(token),
      },
      triggerPressed: {
        backgroundColor: token.colorBgTextActive,
      },
      triggerOpen: {
        borderColor: token.colorPrimary,
      },
      triggerDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      valueArea: {
        flex: 1,
        minWidth: 0,
      },
      suffix: {
        color: token.colorIcon,
        fontSize: sizeConfig.fontSize(token),
      },
      panel: {
        flex: 1,
        gap: sizeConfig.panelGap(token),
      },
      list: {
        flex: 1,
      },
      listContent: {
        gap: token.sizeXXS,
      },
      option: {
        minHeight: token.controlHeightSM,
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorBgContainer,
      },
      optionRow: {
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
      marker: {
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeConfig.lineHeight(token),
      },
      markerDisabled: {
        opacity: token.opacityLoading,
      },
      markerIcon: {
        fontSize: sizeConfig.fontSize(token),
      },
      optionContent: {
        flex: 1,
        minWidth: 0,
      },
      empty: {
        minHeight: token.controlHeight,
        alignItems: 'center',
        justifyContent: 'center',
        padding: token.paddingMD,
      },
      loading: {
        minHeight: token.controlHeight,
        alignItems: 'center',
        justifyContent: 'center',
        padding: token.paddingMD,
      },
      floatingPanelContent: {
        padding: token.paddingMD,
      },
    };
  },
);
