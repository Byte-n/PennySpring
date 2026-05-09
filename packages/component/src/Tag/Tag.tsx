import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { GestureResponderEvent, StyleProp, TextStyle } from 'react-native';
import type { TagColor, TagProps, TagSize, TagVariant } from './types';

interface TagStyleOptions {
  color: TagColor;
  size: TagSize;
  variant: TagVariant;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  borderRadius: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
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

const SIZE_STYLE_MAP: Record<TagSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightXS,
    paddingHorizontal: token => token.paddingXS,
    borderRadius: token => token.borderRadiusSM,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingSM,
    borderRadius: token => token.borderRadius,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  large: {
    minHeight: token => token.controlHeight,
    paddingHorizontal: token => token.padding,
    borderRadius: token => token.borderRadiusLG,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
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

const useStyles = createUseSheetStyle(
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
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
      },
      contentDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);

function renderContent(
  children: TagProps['children'],
  style: StyleProp<TextStyle>,
) {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={style}>{children}</Text>;
  }

  return children;
}

export function Tag({
  children,
  color = 'default',
  disabled = false,
  onPress,
  size = 'normal',
  style,
  styles,
  variant = 'filled',
  ...rest
}: TagProps) {
  const tokenStyles = useStyles({ color, size, variant });
  const isInteractive = Boolean(onPress) && !disabled;
  const shouldUsePressable = Boolean(onPress);
  const contentNode = renderContent(children, [
    tokenStyles.content,
    styles?.content,
    disabled ? tokenStyles.contentDisabled : null,
  ]);

  function handlePress(event: GestureResponderEvent): void {
    if (!isInteractive) {
      return;
    }

    onPress?.(event);
  }

  if (shouldUsePressable) {
    return (
      <Pressable
        {...rest}
        disabled={!isInteractive}
        onPress={handlePress}
        style={({ pressed }) => [
          tokenStyles.root,
          pressed && isInteractive ? tokenStyles.rootPressed : null,
          disabled ? tokenStyles.rootDisabled : null,
          style,
        ]}
      >
        {contentNode}
      </Pressable>
    );
  }

  return (
    <View
      {...rest}
      style={[
        tokenStyles.root,
        disabled ? tokenStyles.rootDisabled : null,
        style,
      ]}
    >
      {contentNode}
    </View>
  );
}
