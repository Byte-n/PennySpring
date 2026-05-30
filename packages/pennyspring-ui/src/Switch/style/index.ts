import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';

interface SizeStyleConfig {
  thumbSize: (token: AliasToken) => number;
  textPadding: (token: AliasToken) => number;
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
    textPadding: token => token.paddingXXS,
  },
  normal: {
    thumbSize: token => token.fontSizeXL,
    textPadding: token => token.paddingXS,
  },
  large: {
    thumbSize: token => token.controlHeightSM,
    textPadding: token => token.paddingSM,
  },
};

interface SwitchGeometry {
  trackHeight: number;
  thumbSize: number;
  inset: number;
  trackWidth: number;
}

function getGeometry(
  token: AliasToken,
  options: Pick<SwitchStyleOptions, 'hasText' | 'size'>,
): SwitchGeometry {
  const sizeConfig = SIZE_STYLE_MAP[options.size];
  const thumbSize = sizeConfig.thumbSize(token);
  const inset = token.lineWidth;
  const trackHeight = thumbSize + inset * 2 + token.lineWidth * 2;
  const baseWidth = thumbSize * 2 + inset * 2 + token.lineWidth * 2;
  const trackWidth = options.hasText
    ? baseWidth + sizeConfig.textPadding(token) * 2
    : baseWidth;

  return { trackHeight, thumbSize, inset, trackWidth };
}

export function getCheckedOffset(
  token: AliasToken,
  options: Pick<SwitchStyleOptions, 'hasText' | 'size'>,
): number {
  const { thumbSize, inset, trackWidth } = getGeometry(token, options);

  return trackWidth - thumbSize - inset - token.lineWidth - inset;
}

export const useStyles = createUseSheetStyle(
  (token, options: SwitchStyleOptions) => {
    const { trackHeight, thumbSize, inset, trackWidth } = getGeometry(
      token,
      options,
    );
    const textReservedSpace = thumbSize + inset + token.lineWidth;
    const trackBorderRadius = trackHeight / 2;
    const textEdgeInset = trackBorderRadius;

    return {
      track: {
        alignItems: 'flex-start',
        backgroundColor: token.colorFillTertiary,
        borderColor: token.colorBorder,
        borderRadius: trackBorderRadius,
        borderWidth: token.lineWidth,
        height: trackHeight,
        justifyContent: 'center',
        width: trackWidth,
      },
      text: {
        left: options.checked ? textEdgeInset : textReservedSpace,
        lineHeight: token.lineHeightSM,
        position: 'absolute',
        right: options.checked ? textReservedSpace : textEdgeInset,
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
      thumbDisabled: {
        backgroundColor: token.colorTextDisabled,
      },
    };
  },
);
