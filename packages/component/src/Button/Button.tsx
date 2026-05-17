import type { ComponentSize } from '../shares/types';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type {
  AliasToken } from '@pennyspring/theme';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
  } from 'react-native';
import type {
  ButtonColor,
  ButtonLoadingConfig,
  ButtonProps,
  ButtonShape,
  ButtonType,
  ButtonVariant,
} from './types';

interface ButtonStyleOptions {
  block: boolean;
  color: ButtonColor;
  ghost: boolean;
  hasContent: boolean;
  shape: ButtonShape;
  size: ComponentSize;
  variant: ButtonVariant;
}

interface SizeStyleConfig {
  height: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
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
  borderStyle?: ViewStyle['borderStyle'];
  color: string;
  pressedBackgroundColor: string;
  pressedBorderColor: string;
}

type TypeDefaults = {
  color: ButtonColor;
  variant: ButtonVariant;
};

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: token => token.controlHeightSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    height: token => token.controlHeight,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    height: token => token.controlHeightLG,
    paddingHorizontal: token => token.paddingMD,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

const TYPE_DEFAULTS: Record<ButtonType, TypeDefaults> = {
  primary: {
    color: 'primary',
    variant: 'solid',
  },
  default: {
    color: 'default',
    variant: 'outlined',
  },
  dashed: {
    color: 'default',
    variant: 'dashed',
  },
  text: {
    color: 'default',
    variant: 'text',
  },
  link: {
    color: 'primary',
    variant: 'link',
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

function isPresetColor(color: ButtonColor): color is (typeof PRESET_COLORS)[number] {
  return PRESET_COLORS.includes(color as (typeof PRESET_COLORS)[number]);
}

function resolveButtonColor(
  color: ButtonColor | undefined,
  danger: boolean | undefined,
  typeDefault: TypeDefaults,
): ButtonColor {
  if (color !== undefined) {
    return color;
  }

  if (danger === true) {
    return 'danger';
  }

  return typeDefault.color;
}

function resolveButtonVariant(
  variant: ButtonVariant | undefined,
  typeDefault: TypeDefaults,
): ButtonVariant {
  return variant ?? typeDefault.variant;
}

function resolveLoadingConfig(
  loading: ButtonProps['loading'],
): ButtonLoadingConfig | undefined {
  if (loading === true) {
    return {};
  }

  if (loading === false || loading === undefined) {
    return undefined;
  }

  return loading;
}

function resolveIconSize(size: ComponentSize, token: AliasToken): number {
  return SIZE_STYLE_MAP[size].height(token) / 2;
}

function resolveColorConfig(token: AliasToken, color: ButtonColor): ColorStyleConfig {
  if (color === 'primary') {
    return {
      base: token.colorPrimary,
      active: token.colorPrimaryActive,
      background: token.colorPrimaryBg,
      border: token.colorPrimaryBorder,
      text: token.colorPrimaryText,
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
  color: ButtonColor,
  variant: ButtonVariant,
  ghost: boolean,
): VariantStyleConfig {
  const colorConfig = resolveColorConfig(token, color);
  const resolvedVariant = ghost && variant === 'solid' ? 'outlined' : variant;

  if (resolvedVariant === 'solid') {
    return {
      backgroundColor: colorConfig.base,
      borderColor: colorConfig.base,
      color: token.colorTextLightSolid,
      pressedBackgroundColor: colorConfig.active,
      pressedBorderColor: colorConfig.active,
    };
  }

  if (resolvedVariant === 'filled') {
    return {
      backgroundColor: ghost ? TRANSPARENT : colorConfig.background,
      borderColor: TRANSPARENT,
      color: colorConfig.text,
      pressedBackgroundColor: colorConfig.border,
      pressedBorderColor: TRANSPARENT,
    };
  }

  if (resolvedVariant === 'text' || resolvedVariant === 'link') {
    const linkColor = resolvedVariant === 'link' && color === 'primary'
      ? token.colorLink
      : colorConfig.text;

    return {
      backgroundColor: TRANSPARENT,
      borderColor: TRANSPARENT,
      color: linkColor,
      pressedBackgroundColor: token.colorBgTextActive,
      pressedBorderColor: TRANSPARENT,
    };
  }

  return {
    backgroundColor: ghost ? TRANSPARENT : token.colorBgContainer,
    borderColor: colorConfig.border,
    borderStyle: resolvedVariant === 'dashed' ? 'dashed' : 'solid',
    color: colorConfig.text,
    pressedBackgroundColor: colorConfig.background,
    pressedBorderColor: colorConfig.base,
  };
}

const useStyles = createUseSheetStyle(
  (
    token,
    {
      block,
      color,
      ghost,
      hasContent,
      shape,
      size,
      variant,
    }: ButtonStyleOptions,
  ) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const height = sizeConfig.height(token);
    const isTextButton = variant === 'text' || variant === 'link';
    const isCircle = shape === 'circle';
    const variantStyle = resolveVariantStyle(token, color, variant, ghost);
    const borderRadius = shape === 'default' ? token.borderRadius : height / 2;
    const horizontalPadding = isCircle && !hasContent
      ? 0
      : sizeConfig.paddingHorizontal(token);

    return {
      root: {
        minHeight: height,
        minWidth: height,
        width: block ? '100%' : isCircle && !hasContent ? height : undefined,
        paddingHorizontal: horizontalPadding,
        borderRadius,
        borderWidth: isTextButton ? 0 : token.lineWidth,
        borderStyle: variantStyle.borderStyle,
        borderColor: variantStyle.borderColor,
        backgroundColor: variantStyle.backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: sizeConfig.gap(token),
      } as ViewStyle,
      rootPressed: {
        backgroundColor: variantStyle.pressedBackgroundColor,
        borderColor: variantStyle.pressedBorderColor,
      },
      rootDisabled: {
        backgroundColor: isTextButton ? TRANSPARENT : token.colorBgContainerDisabled,
        borderColor: isTextButton ? TRANSPARENT : token.colorBorderDisabled,
        opacity: isTextButton ? token.opacityLoading : undefined,
      },
      rootLoading: {
        opacity: token.opacityLoading,
      },
      icon: {
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      content: {
        color: variantStyle.color,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        fontWeight: String(token.fontWeightMedium) as TextStyle['fontWeight'],
      },
      contentDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);

function renderContent(
  children: ButtonProps['children'],
  style: StyleProp<TextStyle>,
  disabled: boolean,
) {
  if (typeof children === 'string' || typeof children === 'number') {
    return <Text style={style}>{children}</Text>;
  }

  const childItems = React.Children.toArray(children);
  const isPlainTextGroup = childItems.every(
    item => typeof item === 'string' || typeof item === 'number',
  );
  if (isPlainTextGroup) {
    const content = childItems.map(item => String(item)).join('');

    return <Text style={style}>{content}</Text>;
  }

  if (
    React.isValidElement<{ style?: StyleProp<TextStyle> }>(children)
    && children.type === Text
  ) {
    return React.cloneElement(children, {
      style: StyleSheet.flatten(
        disabled
          ? [children.props.style, style]
          : [style, children.props.style],
      ),
    });
  }

  return children;
}

export function Button({
  accessibilityRole,
  accessibilityState,
  block = false,
  children,
  color,
  danger,
  disabled = false,
  ghost = false,
  icon,
  iconProps,
  iconPlacement = 'start',
  loading,
  onPress,
  shape = 'default',
  size = 'normal',
  style,
  styles,
  type = 'default',
  variant,
  ...rest
}: ButtonProps) {
  const { token } = useTheme();
  const typeDefault = TYPE_DEFAULTS[type];
  const resolvedColor = resolveButtonColor(color, danger, typeDefault);
  const resolvedVariant = resolveButtonVariant(variant, typeDefault);
  const loadingConfig = useMemo(() => resolveLoadingConfig(loading), [loading]);
  const hasLoadingRequest = loadingConfig !== undefined;
  const [isDelayComplete, setIsDelayComplete] = useState(
    !hasLoadingRequest || loadingConfig?.delay === undefined,
  );
  const isLoading = hasLoadingRequest && isDelayComplete;
  const hasContent = children !== undefined && children !== null;
  const tokenStyles = useStyles({
    block,
    color: resolvedColor,
    ghost,
    hasContent,
    shape,
    size,
    variant: resolvedVariant,
  });
  const isInteractive = !disabled && !isLoading;
  const loadingIcon = loadingConfig?.icon ?? <ActivityIndicator />;
  const shouldRenderIcon = isLoading || (icon !== undefined && icon !== null);
  const variantStyle = resolveVariantStyle(
    token,
    resolvedColor,
    resolvedVariant,
    ghost,
  );
  const resolvedIconColor = disabled ? token.colorTextDisabled : variantStyle.color;
  const iconNode = shouldRenderIcon ? (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        tokenStyles.icon,
        styles?.icon,
      ]}
    >
      {isLoading ? loadingIcon : (
        <Icon
          color={resolvedIconColor}
          size={resolveIconSize(size, token)}
          {...iconProps}
          icon={icon!}
        />
      )}
    </View>
  ) : null;
  const contentNode = hasContent
    ? renderContent(children, [
      tokenStyles.content,
      styles?.content,
      disabled ? tokenStyles.contentDisabled : null,
    ], disabled)
    : null;

  useEffect(() => {
    if (!hasLoadingRequest) {
      setIsDelayComplete(false);
      return;
    }

    if (loadingConfig?.delay === undefined) {
      setIsDelayComplete(true);
      return;
    }

    setIsDelayComplete(false);
    const timeout = setTimeout(() => {
      setIsDelayComplete(true);
    }, loadingConfig.delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [hasLoadingRequest, loadingConfig?.delay]);

  function handlePress(event: GestureResponderEvent): void {
    if (!isInteractive) {
      return;
    }

    onPress?.(event);
  }

  const orderedChildren = iconPlacement === 'end'
    ? [contentNode, iconNode]
    : [iconNode, contentNode];
  const mergedAccessibilityState: PressableProps['accessibilityState'] = {
    ...accessibilityState,
    disabled: disabled || accessibilityState?.disabled,
    busy: isLoading || accessibilityState?.busy,
  };

  return (
    <Pressable
      {...rest}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={mergedAccessibilityState}
      disabled={!isInteractive}
      onPress={handlePress}
      style={({ pressed }) => [
        tokenStyles.root,
        pressed && isInteractive ? tokenStyles.rootPressed : null,
        disabled ? tokenStyles.rootDisabled : null,
        isLoading ? tokenStyles.rootLoading : null,
        style,
      ]}
    >
      {orderedChildren.map((node, index) => (
        <React.Fragment key={index}>{node}</React.Fragment>
      ))}
    </Pressable>
  );
}
