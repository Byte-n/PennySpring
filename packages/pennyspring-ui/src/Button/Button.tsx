import type { ComponentSize } from '../shares/types';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { TextColor, TextProps, TextSize, TextWeight } from '../Text';
import type {
  GestureResponderEvent,
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
  textColor: TextColor;
  textActiveColor: TextColor;
}

interface VariantStyleConfig {
  backgroundColor: string;
  borderColor: string;
  borderStyle?: ViewStyle['borderStyle'];
  color: string;
  textColor: TextColor;
  pressedBackgroundColor: string;
  pressedBorderColor: string;
  pressedTextColor: TextColor;
}

interface ButtonContentTextProps {
  color: TextColor;
  size: TextSize;
  weight: TextWeight;
}

type TypeDefaults = {
  color: ButtonColor;
  variant: ButtonVariant;
};

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: token => token.controlHeightSM,
    paddingHorizontal: token => token.paddingXS,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    height: token => token.controlHeight,
    paddingHorizontal: token => token.paddingSM,
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
  danger: {
    color: 'danger',
    variant: 'solid',
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
const HALF_RATIO = 2;

function isPresetColor(
  color: ButtonColor,
): color is (typeof PRESET_COLORS)[number] {
  return PRESET_COLORS.includes(color as (typeof PRESET_COLORS)[number]);
}

function resolveButtonColor(
  color: ButtonColor | undefined,
  typeDefault: TypeDefaults,
): ButtonColor {
  return color ?? typeDefault.color;
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

function resolveTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

function resolveTextColor(
  disabled: boolean,
  variantTextColor: TextColor,
): TextColor {
  return disabled ? 'disabled' : variantTextColor;
}

function resolveColorConfig(
  token: AliasToken,
  color: ButtonColor,
): ColorStyleConfig {
  if (color === 'primary') {
    return {
      base: token.colorPrimary,
      active: token.colorPrimaryActive,
      background: token.colorPrimaryBg,
      border: token.colorPrimaryBorder,
      text: token.colorPrimaryText,
      textColor: 'primaryText',
      textActiveColor: 'primaryTextActive',
    };
  }

  if (color === 'danger') {
    return {
      base: token.colorError,
      active: token.colorErrorActive,
      background: token.colorErrorBg,
      border: token.colorErrorBorder,
      text: token.colorErrorText,
      textColor: 'errorText',
      textActiveColor: 'errorTextActive',
    };
  }

  if (isPresetColor(color)) {
    return {
      base: token[`${color}6`],
      active: token[`${color}7`],
      background: token[`${color}1`],
      border: token[`${color}3`],
      text: token[`${color}6`],
      textColor: `${color}6`,
      textActiveColor: `${color}7`,
    };
  }

  return {
    base: token.colorText,
    active: token.colorText,
    background: token.colorFillQuaternary,
    border: token.colorBorder,
    text: token.colorText,
    textColor: 'default',
    textActiveColor: 'default',
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
      textColor: 'lightSolid',
      pressedBackgroundColor: colorConfig.active,
      pressedBorderColor: colorConfig.active,
      pressedTextColor: 'lightSolid',
    };
  }

  if (resolvedVariant === 'filled') {
    return {
      backgroundColor: ghost ? TRANSPARENT : colorConfig.background,
      borderColor: TRANSPARENT,
      color: colorConfig.text,
      textColor: colorConfig.textColor,
      pressedBackgroundColor: colorConfig.border,
      pressedBorderColor: TRANSPARENT,
      pressedTextColor: colorConfig.textColor,
    };
  }

  if (resolvedVariant === 'text' || resolvedVariant === 'link') {
    const isLinkPrimary = resolvedVariant === 'link' && color === 'primary';
    const linkColor = isLinkPrimary ? token.colorLink : colorConfig.text;
    const linkTextColor: TextColor = isLinkPrimary
      ? 'link'
      : colorConfig.textColor;
    const pressedLinkTextColor: TextColor = isLinkPrimary
      ? 'linkActive'
      : colorConfig.textActiveColor;
    const pressedBackgroundColor =
      resolvedVariant === 'link' ? TRANSPARENT : token.colorBgTextActive;

    return {
      backgroundColor: TRANSPARENT,
      borderColor: TRANSPARENT,
      color: linkColor,
      textColor: linkTextColor,
      pressedBackgroundColor,
      pressedBorderColor: TRANSPARENT,
      pressedTextColor: pressedLinkTextColor,
    };
  }

  return {
    backgroundColor: ghost ? TRANSPARENT : token.colorBgContainer,
    borderColor: colorConfig.border,
    borderStyle: resolvedVariant === 'dashed' ? 'dashed' : 'solid',
    color: colorConfig.text,
    textColor: colorConfig.textColor,
    pressedBackgroundColor: colorConfig.background,
    pressedBorderColor: colorConfig.base,
    pressedTextColor: colorConfig.textActiveColor,
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
    const horizontalPadding =
      isCircle && !hasContent ? 0 : sizeConfig.paddingHorizontal(token);
    const verticalPadding = horizontalPadding / 2;

    return {
      root: {
        width: block ? '100%' : isCircle && !hasContent ? height : undefined,
        paddingHorizontal: horizontalPadding,
        paddingVertical: verticalPadding,
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
        backgroundColor: isTextButton
          ? TRANSPARENT
          : token.colorBgContainerDisabled,
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
        fontFamily: token.fontFamily,
        lineHeight: sizeConfig.lineHeight(token),
      },
      contentDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);

function renderContent(
  children: ButtonProps['children'],
  textProps: ButtonContentTextProps,
  style: StyleProp<TextStyle>,
  stateStyle?: StyleProp<TextStyle>,
) {
  if (typeof children === 'string' || typeof children === 'number') {
    return (
      <Text
        color={textProps.color}
        size={textProps.size}
        style={[style, stateStyle]}
        weight={textProps.weight}
      >
        {children}
      </Text>
    );
  }

  const childItems = React.Children.toArray(children);
  const isPlainTextGroup = childItems.every(
    item => typeof item === 'string' || typeof item === 'number',
  );
  if (isPlainTextGroup) {
    const content = childItems.map(item => String(item)).join('');

    return (
      <Text
        color={textProps.color}
        size={textProps.size}
        style={[style, stateStyle]}
        weight={textProps.weight}
      >
        {content}
      </Text>
    );
  }

  if (React.isValidElement<TextProps>(children) && children.type === Text) {
    return React.cloneElement(children, {
      color: children.props.color ?? textProps.color,
      size: children.props.size ?? textProps.size,
      style: StyleSheet.flatten([style, children.props.style, stateStyle]),
      weight: children.props.weight ?? textProps.weight,
    });
  }

  return children;
}

export function Button({
  block = false,
  children,
  color,
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
  const resolvedColor = resolveButtonColor(color, typeDefault);
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
  const shouldRenderIcon = isLoading || (icon !== undefined && icon !== null);
  const variantStyle = resolveVariantStyle(
    token,
    resolvedColor,
    resolvedVariant,
    ghost,
  );
  const loadingIndicatorColor = disabled
    ? token.colorTextDisabled
    : variantStyle.color;
  const textSize = resolveTextSize(size);
  const loadingIcon =
    loadingConfig?.icon ?? (
      <ActivityIndicator
        color={loadingIndicatorColor}
        size={resolveIconSize(size, token)}
      />
    );

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

  function renderChildren(pressed: boolean) {
    const isPressed = pressed && isInteractive;
    const activeIconColor = resolveTextColor(
      disabled,
      isPressed ? variantStyle.pressedTextColor : variantStyle.textColor,
    );
    const activeTextProps: ButtonContentTextProps = {
      color: activeIconColor,
      size: textSize,
      weight: 'medium',
    };
    const activeIconNode = shouldRenderIcon ? (
      <Row align="center" justify="center" style={[tokenStyles.icon, styles?.icon]}>
        {isLoading ? (
          loadingIcon
        ) : (
          <Icon
            color={activeIconColor}
            size={size}
            {...iconProps}
            icon={icon!}
          />
        )}
      </Row>
    ) : null;
    const activeContentNode = hasContent
      ? renderContent(
          children,
          activeTextProps,
          [tokenStyles.content, styles?.content],
          disabled ? tokenStyles.contentDisabled : null,
        )
      : null;
    const orderedChildren =
      iconPlacement === 'end'
        ? [activeContentNode, activeIconNode]
        : [activeIconNode, activeContentNode];

    return orderedChildren.map((node, index) => (
      <React.Fragment key={index}>{node}</React.Fragment>
    ));
  }

  return (
    <Pressable
      {...rest}
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
      {({ pressed }) => renderChildren(pressed)}
    </Pressable>
  );
}
