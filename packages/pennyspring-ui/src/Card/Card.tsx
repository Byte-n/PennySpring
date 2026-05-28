import type { ComponentSize } from '../shares/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { Column } from '../Column';
import { Row } from '../Row';
import type {
  GestureResponderEvent,
} from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { CardProps,
  CardVariant,
} from './types';
import type { TextSize } from '../Text/types';

interface CardStyleOptions {
  size: ComponentSize;
  variant: CardVariant;
}

interface SizeStyleConfig {
  padding: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  titleTextSize: TextSize;
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
    gap: token => token.marginXXS,
    titleTextSize: 'md',
    borderRadius: token => token.borderRadiusSM,
  },
  normal: {
    padding: token => token.padding,
    gap: token => token.marginXS,
    titleTextSize: 'lg',
    borderRadius: token => token.borderRadius,
  },
  large: {
    padding: token => token.paddingMD,
    gap: token => token.marginSM,
    titleTextSize: 'xl',
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
        gap,
        marginBottom: gap,
      },
      titleContainer: {
        flex: 1,
      },
      extra: {
        alignSelf: 'center',
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
  const hasTitleNode = title !== undefined && title !== null;
  const hasTitleText = titleText !== undefined;
  const hasExtra = extra !== undefined && extra !== null && extra !== false;
  const shouldRenderHeader = hasTitleNode || hasTitleText || hasExtra;
  const shouldRenderFooter = footer !== undefined && footer !== null && footer !== false;
  const shouldRenderLoadingNode = loading && loadingNode !== undefined;
  const bodyContent = shouldRenderLoadingNode ? loadingNode : children;

  function handlePress(event: GestureResponderEvent): void {
    if (!isInteractive) {
      return;
    }

    onPress?.(event);
  }

  function renderTitle() {
    if (hasTitleNode) {
      return title;
    }

    if (hasTitleText) {
      return (
        <Text
          color="heading"
          size={SIZE_STYLE_MAP[size].titleTextSize}
          style={styles?.titleText}
          weight="strong"
        >
          {titleText}
        </Text>
      );
    }

    return null;
  }

  const content = (
    <Column>
      {shouldRenderHeader ? (
        <Row align="center" style={[tokenStyles.header, styles?.header]}>
          <Column style={tokenStyles.titleContainer}>{renderTitle()}</Column>
          {hasExtra ? (
            <Column style={[tokenStyles.extra, styles?.extra]}>{extra}</Column>
          ) : null}
        </Row>
      ) : null}
      <Column
        style={[
          tokenStyles.body,
          styles?.body,
          loading ? tokenStyles.bodyLoading : null,
        ]}
      >
        {bodyContent}
      </Column>
      {shouldRenderFooter ? (
        <Column style={[tokenStyles.footer, styles?.footer]}>{footer}</Column>
      ) : null}
    </Column>
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
