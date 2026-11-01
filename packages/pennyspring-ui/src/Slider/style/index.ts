import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

export interface SliderStyleOptions {
  size: ComponentSize;
  disabled: boolean;
  progress: number;
  trackWidth: number;
}

interface SliderSizeConfig {
  height: (token: AliasToken) => number;
  thumbSize: number;
  trackHeight: number;
}

/** 轨道 4 / 6 / 8 与 thumb 16 / 20 / 24 在 AliasToken 中没有对应档位。 */
const SIZE_MAP: Record<ComponentSize, SliderSizeConfig> = {
  small: {
    height: token => token.controlHeightSM,
    thumbSize: 16,
    trackHeight: 4,
  },
  normal: {
    height: token => token.controlHeight,
    thumbSize: 20,
    trackHeight: 6,
  },
  large: {
    height: token => token.controlHeightLG,
    thumbSize: 24,
    trackHeight: 8,
  },
};

const PILL_RADIUS = 999;

export const useStyles = createUseSheetStyle(
  (token, { size, disabled, progress, trackWidth }: SliderStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];
    const thumbRadius = sizeConfig.thumbSize / 2;

    return {
      root: {
        justifyContent: 'center',
        minHeight: sizeConfig.height(token),
      },
      track: {
        backgroundColor: disabled
          ? token.colorFillQuaternary
          : token.colorFillSecondary,
        borderRadius: PILL_RADIUS,
        height: sizeConfig.trackHeight,
        marginHorizontal: thumbRadius,
        overflow: 'hidden',
      },
      trackFill: {
        backgroundColor: disabled
          ? token.colorTextQuaternary
          : token.colorPrimary,
        borderRadius: PILL_RADIUS,
        height: '100%',
        width: `${progress * 100}%`,
      },
      thumbContainer: {
        left: trackWidth * progress,
        position: 'absolute',
        top: '50%',
      },
      thumb: {
        backgroundColor: token.colorBgContainer,
        borderColor: token.colorPrimary,
        borderRadius: PILL_RADIUS,
        borderWidth: token.lineWidthBold,
        height: sizeConfig.thumbSize,
        marginTop: -thumbRadius,
        width: sizeConfig.thumbSize,
      },
      thumbRaised: toShadowStyle(token.boxShadowTertiary),
      thumbDisabled: {
        borderColor: token.colorBorder,
        borderWidth: token.lineWidth,
      },
    };
  },
);
