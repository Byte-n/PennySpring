import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
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

/** 加载态只把内容压到 45%，opacityLoading(.65) 在卡片上过重。 */
const LOADING_OPACITY = 0.45;

interface SizeStyleConfig {
  padding: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  titleTextSize: TextSize;
  borderRadius: (token: AliasToken) => number;
}

type VariantStyleConfig = (token: AliasToken) => {
  backgroundColor: string;
  shadow?: ReturnType<typeof toShadowStyle>;
};

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    padding: token => token.paddingSM,
    gap: token => token.marginXS,
    titleTextSize: 'sm',
    borderRadius: token => token.borderRadius,
  },
  normal: {
    padding: token => token.padding,
    gap: token => token.marginSM,
    titleTextSize: 'md',
    borderRadius: token => token.borderRadius,
  },
  large: {
    padding: token => token.paddingMD,
    gap: token => token.marginSM,
    titleTextSize: 'md',
    borderRadius: token => token.borderRadiusLG,
  },
};

/** 三种变体一律无描边：plain / summary 靠页面底分层，elevated 只用阴影。 */
const VARIANT_STYLE_MAP: Record<CardVariant, VariantStyleConfig> = {
  plain: token => ({
    backgroundColor: token.colorBgContainer,
  }),
  elevated: token => ({
    backgroundColor: token.colorBgElevated,
    shadow: toShadowStyle(token.boxShadowTertiary),
  }),
  summary: token => ({
    backgroundColor: token.colorBgContainer,
  }),
};

const useStyles = createUseSheetStyle(
  (token, { size, variant }: CardStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const variantConfig = VARIANT_STYLE_MAP[variant](token);
    const gap = sizeConfig.gap(token);
    const padding = sizeConfig.padding(token);

    return {
      root: {
        backgroundColor: variantConfig.backgroundColor,
        borderRadius: sizeConfig.borderRadius(token),
        padding,
        ...(variantConfig.shadow ?? {}),
      },
      rootPressed: {
        backgroundColor: token.colorFillTertiary,
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
        opacity: LOADING_OPACITY,
      },
      footer: {
        borderTopColor: token.colorSplit,
        borderTopWidth: token.lineWidth,
        marginHorizontal: -padding,
        marginTop: gap,
        paddingHorizontal: padding,
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
          color={disabled ? 'tertiary' : 'default'}
          size={SIZE_STYLE_MAP[size].titleTextSize}
          style={styles?.titleText}
          weight="semibold"
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
            <Column style={[tokenStyles.extra, styles?.extra]}>
              {renderTextNode(extra, (text) => (
                <Text color="tertiary" size="sm">{text}</Text>
              ))}
            </Column>
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
        <Column style={[tokenStyles.footer, styles?.footer]}>
          {renderTextNode(footer, (text) => (
            <Text color="secondary" size="sm">{text}</Text>
          ))}
        </Column>
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
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[tokenStyles.root, style]}>{content}</View>;
}
