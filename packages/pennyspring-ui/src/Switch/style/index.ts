import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

/** 滑块 14 / 20 / 26 与轨道 28×8 / 40×10 / 52×12 在 AliasToken 中没有对应档位。 */
const THUMB_SIZE_MAP: Record<ComponentSize, number> = {
  small: 14,
  normal: 20,
  large: 26,
};

const TRACK_HEIGHT_MAP: Record<ComponentSize, number> = {
  small: 8,
  normal: 10,
  large: 12,
};

export interface SwitchStyleOptions {
  checked: boolean;
  disabled: boolean;
  readonly: boolean;
  size: ComponentSize;
}

function getContainerHeight(
  token: AliasToken,
  size: ComponentSize,
): number {
  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  return token.controlHeight;
}

/** 位移等于滑块直径，轨道宽度等于滑块的两倍。 */
export function getThumbOffset(size: ComponentSize): number {
  return THUMB_SIZE_MAP[size];
}

export const useStyles = createUseSheetStyle(
  (token, { checked, size }: SwitchStyleOptions) => {
    const thumbSize = THUMB_SIZE_MAP[size];
    const trackHeight = TRACK_HEIGHT_MAP[size];

    return {
      container: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: token.sizeXS,
        height: getContainerHeight(token, size),
      },
      box: {
        height: thumbSize,
        width: thumbSize * 2,
      },
      track: {
        backgroundColor: token.colorFillSecondary,
        borderRadius: trackHeight / 2,
        height: trackHeight,
        left: 0,
        position: 'absolute',
        right: 0,
        top: (thumbSize - trackHeight) / 2,
      },
      trackChecked: {
        backgroundColor: token.colorPrimary,
      },
      trackDisabled: {
        backgroundColor: token.colorFillQuaternary,
      },
      trackDisabledChecked: {
        backgroundColor: token.colorFillTertiary,
      },
      thumb: {
        backgroundColor: token.colorBgContainer,
        borderRadius: thumbSize / 2,
        height: thumbSize,
        left: 0,
        position: 'absolute',
        top: 0,
        width: thumbSize,
      },
      thumbRaised: toShadowStyle(token.boxShadowTertiary),
      thumbDisabled: {
        backgroundColor: checked
          ? token.colorTextTertiary
          : token.colorFillTertiary,
      },
      thumbReadonly: {
        borderColor: token.colorBorder,
        borderWidth: token.lineWidth,
      },
      text: {
        flexShrink: 1,
      },
    };
  },
);
