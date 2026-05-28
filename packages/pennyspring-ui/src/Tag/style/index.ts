import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { TagColor, TagVariant } from '../types';
import type { TextSize } from '../../Text';

export interface TagStyleOptions {
  color: TagColor;
  size: ComponentSize;
  variant: TagVariant;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  borderRadius: (token: AliasToken) => number;
  textSize: TextSize;
}

interface ColorStyleConfig {
  base: string;
  active: string;
  background: string;
  border: string;
  text: string;
}

interface VariantStyleConfig {
  backgroundColor: string;
  borderColor: string;
  color: string;
  pressedBackgroundColor: string;
  pressedBorderColor: string;
}

export const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightXS,
    paddingHorizontal: token => token.paddingXS,
    borderRadius: token => token.borderRadiusSM,
    textSize: 'sm',
  },
  normal: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingSM,
    borderRadius: token => token.borderRadius,
    textSize: 'sm',
  },
  large: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.padding,
    borderRadius: token => token.borderRadiusLG,
    textSize: 'md',
  },
};

const PRESET_COLORS = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const;

const TRANSPARENT = 'transparent';

function isPresetColor(color: TagColor): color is (typeof PRESET_COLORS)[number] {
  return PRESET_COLORS.includes(color as (typeof PRESET_COLORS)[number]);
}

function resolveColorConfig(token: AliasToken, color: TagColor): ColorStyleConfig {
  if (color === 'primary') {
    return {
      base: token.colorPrimary,
      active: token.colorPrimaryActive,
      background: token.colorPrimaryBg,
      border: token.colorPrimaryBorder,
      text: token.colorPrimaryText,
    };
  }

  if (color === 'success') {
    return {
      base: token.colorSuccess,
      active: token.colorSuccessActive,
      background: token.colorSuccessBg,
      border: token.colorSuccessBorder,
      text: token.colorSuccessText,
    };
  }

  if (color === 'warning') {
    return {
      base: token.colorWarning,
      active: token.colorWarningActive,
      background: token.colorWarningBg,
      border: token.colorWarningBorder,
      text: token.colorWarningText,
    };
  }

  if (color === 'danger') {
    return {
      base: token.colorError,
      active: token.colorErrorActive,
      background: token.colorErrorBg,
      border: token.colorErrorBorder,
      text: token.colorErrorText,
    };
  }

  if (color === 'info') {
    return {
      base: token.colorInfo,
      active: token.colorInfoActive,
      background: token.colorInfoBg,
      border: token.colorInfoBorder,
      text: token.colorInfoText,
    };
  }

  if (isPresetColor(color)) {
    return {
      base: token[`${color}6`],
      active: token[`${color}7`],
      background: token[`${color}1`],
      border: token[`${color}3`],
      text: token[`${color}6`],
    };
  }

  return {
    base: token.colorText,
    active: token.colorText,
    background: token.colorFillQuaternary,
    border: token.colorBorder,
    text: token.colorText,
  };
}

function resolveVariantStyle(
  token: AliasToken,
  color: TagColor,
  variant: TagVariant,
): VariantStyleConfig {
  const colorConfig = resolveColorConfig(token, color);

  if (variant === 'solid') {
    return {
      backgroundColor: colorConfig.base,
      borderColor: colorConfig.base,
      color: token.colorTextLightSolid,
      pressedBackgroundColor: colorConfig.active,
      pressedBorderColor: colorConfig.active,
    };
  }

  if (variant === 'outlined') {
    return {
      backgroundColor: TRANSPARENT,
      borderColor: colorConfig.border,
      color: colorConfig.text,
      pressedBackgroundColor: colorConfig.background,
      pressedBorderColor: colorConfig.base,
    };
  }

  return {
    backgroundColor: colorConfig.background,
    borderColor: colorConfig.background,
    color: colorConfig.text,
    pressedBackgroundColor: colorConfig.border,
    pressedBorderColor: colorConfig.border,
  };
}

export const useStyles = createUseSheetStyle(
  (token, { color, size, variant }: TagStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const variantStyle = resolveVariantStyle(token, color, variant);

    return {
      root: {
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: variantStyle.backgroundColor,
        borderColor: variantStyle.borderColor,
        borderRadius: sizeConfig.borderRadius(token),
        borderWidth: token.lineWidth,
        flexDirection: 'row',
        justifyContent: 'center',
        minHeight: sizeConfig.minHeight(token),
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
      },
      rootPressed: {
        backgroundColor: variantStyle.pressedBackgroundColor,
        borderColor: variantStyle.pressedBorderColor,
      },
      rootDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorderDisabled,
      },
      content: {
        color: variantStyle.color,
      },
      contentDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);
