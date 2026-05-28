import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

const DEFAULT_TRACK_WIDTH_SCALE = 2;
const TEXT_TRACK_WIDTH_SCALE = 3;

interface SizeStyleConfig {
  thumbSize: (token: AliasToken) => number;
  inset: (token: AliasToken) => number;
}

export interface SwitchStyleOptions {
  checked: boolean;
  disabled: boolean;
  hasText: boolean;
  size: ComponentSize;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    thumbSize: token => token.fontSize,
    inset: token => token.lineWidth,
  },
  normal: {
    thumbSize: token => token.fontSizeXL,
    inset: token => token.lineWidth,
  },
  large: {
    thumbSize: token => token.controlHeightSM,
    inset: token => token.lineWidth,
  },
};

export const useStyles = createUseSheetStyle(
  (token, options: SwitchStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[options.size];
    const thumbSize = sizeConfig.thumbSize(token);
    const trackWidth =
      thumbSize *
      (options.hasText ? TEXT_TRACK_WIDTH_SCALE : DEFAULT_TRACK_WIDTH_SCALE);
    const inset = sizeConfig.inset(token);
    const textReservedSpace = thumbSize + inset + token.lineWidth;
    const checkedOffset =
      trackWidth - thumbSize - inset - token.lineWidth - inset;
    const trackHeight = thumbSize + inset * 2 + token.lineWidth * 2;
    const trackBorderRadius = trackHeight / 2;

    return {
      track: {
        alignItems: 'flex-start',
        backgroundColor: token.colorFillTertiary,
        borderColor: token.colorBorder,
        borderRadius: trackBorderRadius,
        borderWidth: token.lineWidth,
        justifyContent: 'center',
        width: trackWidth,
      },
      text: {
        left: options.checked
          ? inset + token.lineWidth
          : textReservedSpace,
        lineHeight: token.lineHeightSM,
        position: 'absolute',
        right: options.checked
          ? textReservedSpace
          : inset + token.lineWidth,
      },
      trackChecked: {
        backgroundColor: token.colorPrimary,
        borderColor: token.colorPrimary,
      },
      trackDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorderDisabled,
      },
      trackReadonly: {
        borderColor: token.colorBorderSecondary,
      },
      trackPressed: {
        backgroundColor: token.controlItemBgActive,
      },
      thumb: {
        backgroundColor: token.colorBgContainer,
        borderRadius: thumbSize,
        height: thumbSize,
        marginLeft: inset,
        width: thumbSize,
      },
      thumbChecked: {
        transform: [{ translateX: checkedOffset }],
      },
      thumbDisabled: {
        backgroundColor: token.colorTextDisabled,
      },
    };
  },
);
