import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface SegmentedStyleOptions {
  block: boolean;
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  inset: number;
  trackRadius: number;
  itemPaddingHorizontal: (token: AliasToken) => number;
  trackHeight: (token: AliasToken) => number;
}

/** 图标与文字间距 6 无对应 token。 */
const ICON_GAP = 6;

/** 自动宽度下每个 item 的最小宽度。 */
const ITEM_MIN_WIDTH = 64;

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    inset: 2,
    trackRadius: 10,
    itemPaddingHorizontal: token => token.paddingXS,
    trackHeight: token => token.controlHeightSM,
  },
  normal: {
    inset: 3,
    trackRadius: 12,
    itemPaddingHorizontal: token => token.paddingSM,
    trackHeight: token => token.controlHeight,
  },
  large: {
    inset: 4,
    trackRadius: 16,
    itemPaddingHorizontal: token => token.padding,
    trackHeight: token => token.controlHeightLG,
  },
};

function getItemRadius(token: AliasToken, size: ComponentSize): number {
  return size === 'large' ? token.borderRadiusLG : token.borderRadius;
}

export const useStyles = createUseSheetStyle(
  (token, { block, disabled, size }: SegmentedStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const itemRadius = getItemRadius(token, size);
    const itemHeight = sizeConfig.trackHeight(token) - sizeConfig.inset * 2;

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      track: {
        alignItems: 'center',
        backgroundColor: disabled
          ? token.colorFillQuaternary
          : token.colorFillTertiary,
        borderRadius: sizeConfig.trackRadius,
        flexDirection: 'row',
        height: sizeConfig.trackHeight(token),
        padding: sizeConfig.inset,
      },
      item: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: itemRadius,
        flex: block ? 1 : undefined,
        height: itemHeight,
        justifyContent: 'center',
        minWidth: ITEM_MIN_WIDTH,
        paddingHorizontal: sizeConfig.itemPaddingHorizontal(token),
      },
      itemSelected: {
        backgroundColor: token.colorBgContainer,
      },
      itemSelectedRaised: toShadowStyle(token.boxShadowTertiary),
      itemSelectedDisabled: {
        backgroundColor: token.colorFillTertiary,
      },
      itemPressed: {
        backgroundColor: token.colorFillSecondary,
      },
      content: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: ICON_GAP,
        justifyContent: 'center',
      },
      icon: {
        alignItems: 'center',
        justifyContent: 'center',
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
