import { createUseSheetStyle } from '@pennyspring/theme';
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
  thumbSize: (token: AliasToken) => number;
  trackHeight: (token: AliasToken) => number;
}

export const SIZE_MAP: Record<ComponentSize, SliderSizeConfig> = {
  small: {
    height: token => token.controlHeightSM,
    thumbSize: token => token.fontSize,
    trackHeight: token => token.lineWidthBold,
  },
  normal: {
    height: token => token.controlHeight,
    thumbSize: token => token.fontSizeXL,
    trackHeight: token => token.sizeXXS,
  },
  large: {
    height: token => token.controlHeightLG,
    thumbSize: token => token.fontSizeHeading5,
    trackHeight: token => token.sizeXS,
  },
};

export const useStyles = createUseSheetStyle(
  (token, { size, disabled, progress, trackWidth }: SliderStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        minHeight: sizeConfig.height(token),
        justifyContent: 'center',
      },
      track: {
        width: '100%',
        height: sizeConfig.trackHeight(token),
        borderRadius: token.borderRadiusSM,
        backgroundColor: disabled ? token.colorFillTertiary : token.colorFillSecondary,
        overflow: 'hidden',
      },
      trackFill: {
        width: `${progress * 100}%`,
        height: '100%',
        borderRadius: token.borderRadiusSM,
        backgroundColor: disabled ? token.colorFillContent : token.colorPrimary,
      },
      thumbContainer: {
        position: 'absolute',
        top: '50%',
        left: trackWidth * progress,
      },
      thumb: {
        width: sizeConfig.thumbSize(token),
        height: sizeConfig.thumbSize(token),
        marginTop: -sizeConfig.thumbSize(token) / 2,
        borderRadius: token.borderRadius,
        backgroundColor: disabled ? token.colorFillContent : token.colorBgContainer,
        borderWidth: token.lineWidth,
        borderColor: disabled ? token.colorBorderDisabled : token.colorPrimary,
      },
    };
  },
);
