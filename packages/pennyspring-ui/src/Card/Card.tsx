import type { ComponentSize } from '../shares/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type {
  GestureResponderEvent,
  TextStyle } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { CardProps,
  CardVariant,
} from './types';

interface CardStyleOptions {
  size: ComponentSize;
  variant: CardVariant;
}

interface SizeStyleConfig {
  padding: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  titleFontSize: (token: AliasToken) => number;
  titleLineHeight: (token: AliasToken) => number;
  borderRadius: (token: AliasToken) => number;
}

type VariantStyleConfig = (token: AliasToken) => {
  backgroundColor: string;
  borderColor: string;
  shadow?: ReturnType<typeof toShadowStyle>;
};

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    padding: token => token.paddingSM,
    gap: token => token.marginXS,
    titleFontSize: token => token.fontSize,
    titleLineHeight: token => token.lineHeight,
    borderRadius: token => token.borderRadiusSM,
  },
  normal: {
    padding: token => token.paddingMD,
    gap: token => token.marginSM,
    titleFontSize: token => token.fontSizeLG,
    titleLineHeight: token => token.lineHeightLG,
    borderRadius: token => token.borderRadius,
  },
  large: {
    padding: token => token.paddingLG,
    gap: token => token.marginMD,
    titleFontSize: token => token.fontSizeXL,
    titleLineHeight: token => token.lineHeightXL,
    borderRadius: token => token.borderRadiusLG,
  },
};

const VARIANT_STYLE_MAP: Record<CardVariant, VariantStyleConfig> = {
  plain: token => ({
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
  }),
  elevated: token => ({
    backgroundColor: token.colorBgElevated,
    borderColor: token.colorBorderSecondary,
    shadow: toShadowStyle(token.boxShadowTertiary),
  }),
  summary: token => ({
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorPrimaryBorder,
    shadow: toShadowStyle(token.boxShadowTertiary),
  }),
};

const useStyles = createUseSheetStyle(
  (token, { size, variant }: CardStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const variantConfig = VARIANT_STYLE_MAP[variant](token);
    const gap = sizeConfig.gap(token);

    return {
      root: {
        backgroundColor: variantConfig.backgroundColor,
        borderColor: variantConfig.borderColor,
        borderRadius: sizeConfig.borderRadius(token),
        borderWidth: token.lineWidth,
        padding: sizeConfig.padding(token),
        ...(variantConfig.shadow ?? {}),
      },
      rootPressed: {
        backgroundColor: token.colorFillQuaternary,
      },
      rootDisabled: {
        backgroundColor: token.colorBgContainerDisabled,
        opacity: token.opacityLoading,
      },
      header: {
        alignItems: 'center',
        flexDirection: 'row',
        gap,
        marginBottom: gap,
      },
      titleContainer: {
        flex: 1,
      },
      title: {
        color: token.colorTextHeading,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.titleFontSize(token),
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
        lineHeight: sizeConfig.titleLineHeight(token),
      },
      extra: {
        alignItems: 'center',
        flexDirection: 'row',
      },
      body: {},
      bodyLoading: {
        opacity: token.opacityLoading,
      },
      footer: {
        borderTopColor: token.colorSplit,
        borderTopWidth: token.lineWidth,
        marginTop: gap,
        paddingTop: gap,
      },
    };
  },
);

export function Card({
  children,
  disabled = false,
  extra,
  footer,
  loading = false,
  loadingNode,
  onPress,
  size = 'normal',
  style,
  styles,
  title,
  titleText,
  variant = 'plain',
}: CardProps) {
  const tokenStyles = useStyles({ size, variant });
  const isInteractive = Boolean(onPress) && !disabled && !loading;
  const shouldUsePressable = Boolean(onPress);
  const shouldRenderHeader = title !== undefined || titleText !== undefined || extra !== undefined;
  const shouldRenderFooter = footer !== undefined;
  const shouldRenderLoadingNode = loading && loadingNode !== undefined;
  const bodyContent = shouldRenderLoadingNode ? loadingNode : children;

  function handlePress(event: GestureResponderEvent): void {
    if (!isInteractive) {
      return;
    }

    onPress?.(event);
  }

  function renderTitle() {
    if (title !== undefined) {
      return title;
    }

    if (titleText !== undefined) {
      return <Text style={[tokenStyles.title, styles?.titleText]}>{titleText}</Text>;
    }

    return null;
  }

  const content = (
    <>
      {shouldRenderHeader ? (
        <View style={[tokenStyles.header, styles?.header]}>
          <View style={tokenStyles.titleContainer}>{renderTitle()}</View>
          {extra !== undefined ? (
            <View style={[tokenStyles.extra, styles?.extra]}>{extra}</View>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          tokenStyles.body,
          styles?.body,
          loading ? tokenStyles.bodyLoading : null,
        ]}
      >
        {bodyContent}
      </View>
      {shouldRenderFooter ? (
        <View style={[tokenStyles.footer, styles?.footer]}>{footer}</View>
      ) : null}
    </>
  );

  if (shouldUsePressable) {
    return (
      <Pressable
        disabled={!isInteractive}
        onPress={handlePress}
        style={({ pressed }) => [
          tokenStyles.root,
          pressed && isInteractive ? tokenStyles.rootPressed : null,
          disabled ? tokenStyles.rootDisabled : null,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[tokenStyles.root, style]}>{content}</View>;
}
