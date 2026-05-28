import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface SegmentedStyleOptions {
  block: boolean;
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  itemPaddingHorizontal: (token: AliasToken) => number;
  itemPaddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    itemPaddingHorizontal: token => token.controlPaddingHorizontalSM,
    itemPaddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXXS,
  },
  normal: {
    minHeight: token => token.controlHeight,
    itemPaddingHorizontal: token => token.controlPaddingHorizontal,
    itemPaddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.sizeXXS,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    itemPaddingHorizontal: token => token.paddingMD,
    itemPaddingVertical: token => token.paddingMD / 2,
    gap: token => token.sizeXS,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { block, disabled, size }: SegmentedStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      track: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: sizeConfig.minHeight(token),
        padding: token.paddingXXS,
        borderRadius: token.borderRadius,
        backgroundColor: disabled
          ? token.colorBgContainerDisabled
          : token.colorFillTertiary,
      },
      trackDisabled: {
        borderColor: token.colorBorderDisabled,
      },
      item: {
        flex: block ? 1 : undefined,
        minHeight: sizeConfig.minHeight(token) - token.paddingXXS * 2,
        paddingHorizontal: sizeConfig.itemPaddingHorizontal(token),
        paddingVertical: sizeConfig.itemPaddingVertical(token),
        borderRadius: token.borderRadiusSM,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
      itemSelected: {
        backgroundColor: token.colorBgContainer,
      },
      itemPressed: {
        backgroundColor: token.controlItemBgActive,
      },
      itemDisabled: {
        backgroundColor: 'transparent',
      },
      content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeConfig.gap(token),
      },
      icon: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      iconSelected: {
        opacity: 1,
      },
      iconDisabled: {
        opacity: token.opacityLoading,
      },
      label: {
        fontFamily: token.fontFamily,
      },
    };
  },
);
