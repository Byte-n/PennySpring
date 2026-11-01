import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  createUseSheetStyle,
  toShadowStyle,
  useTheme,
} from '@pennyspring/theme';
import { Text } from '../Text';
import { Row } from '../Row';
import { Column } from '../Column';
import type { AliasToken } from '@pennyspring/theme';
import type { LoadingProps, LoadingTone, LoadingVariant } from './types';
import type { TextSize } from '../Text';

interface VariantStyleConfig {
  gap: (token: AliasToken) => number;
  textSize: TextSize;
  textColor: 'secondary' | 'tertiary';
}

/** 转圈尺寸在 AliasToken 中没有对应档位，按设计稿落为语义常量。 */
const INDICATOR_SIZE_MAP: Record<ComponentSize, number> = {
  small: 16,
  normal: 20,
  large: 28,
};

const DEFAULT_SIZE_MAP: Record<LoadingVariant, ComponentSize> = {
  inline: 'small',
  block: 'normal',
  more: 'small',
  overlay: 'large',
};

const INLINE_MIN_HEIGHT = 20;
const BLOCK_MIN_HEIGHT = 120;

const VARIANT_STYLE_MAP: Record<LoadingVariant, VariantStyleConfig> = {
  inline: {
    gap: token => token.marginXS,
    textSize: 'xs',
    textColor: 'secondary',
  },
  block: {
    gap: token => token.marginSM,
    textSize: 'sm',
    textColor: 'secondary',
  },
  more: {
    gap: token => token.marginXS,
    textSize: 'xs',
    textColor: 'tertiary',
  },
  overlay: {
    gap: token => token.marginSM,
    textSize: 'xs',
    textColor: 'secondary',
  },
};

const TONE_COLOR_MAP: Record<LoadingTone, (token: AliasToken) => string> = {
  primary: token => token.colorPrimary,
  muted: token => token.colorTextTertiary,
  inverse: token => token.colorTextLightSolid,
};

const useStyles = createUseSheetStyle(token => {
  return {
    inline: {
      minHeight: INLINE_MIN_HEIGHT,
    },
    block: {
      minHeight: BLOCK_MIN_HEIGHT,
      width: '100%',
    },
    more: {
      paddingVertical: token.paddingSM,
      width: '100%',
    },
    overlay: {
      alignItems: 'center',
      backgroundColor: token.colorBgMask,
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute' as const,
      right: 0,
      top: 0,
    },
    overlayCard: {
      alignItems: 'center',
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      paddingHorizontal: token.paddingLG,
      paddingVertical: token.paddingMD,
      ...toShadowStyle(token.boxShadowTertiary),
    },
    indicator: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    description: {
      marginTop: token.marginXXS,
      textAlign: 'center' as const,
    },
    textBlock: {
      alignItems: 'center',
    },
  };
});

export function Loading({
  animating = true,
  description,
  hidesWhenStopped = true,
  indicator,
  size,
  style,
  styles,
  text,
  tone = 'primary',
  variant = 'inline',
  ...rest
}: LoadingProps) {
  const resolvedSize = size ?? DEFAULT_SIZE_MAP[variant];
  const tokenStyles = useStyles();
  const { token } = useTheme();
  const variantConfig = VARIANT_STYLE_MAP[variant];
  const hasText = text !== undefined && text !== '';
  const hasDescription =
    description !== undefined && description !== null && description !== false;

  // 停止且没有任何文案时不留空占位，避免布局跳动。
  if (!animating && !hasText && !hasDescription) {
    return null;
  }

  const resolvedIndicator =
    indicator === undefined ? (
      animating ? (
        <ActivityIndicator
          {...rest}
          animating={animating}
          color={TONE_COLOR_MAP[tone](token)}
          hidesWhenStopped={hidesWhenStopped}
          size={INDICATOR_SIZE_MAP[resolvedSize]}
        />
      ) : null
    ) : (
      renderTextNode(indicator, value => <Text>{value}</Text>)
    );

  const indicatorNode =
    resolvedIndicator === null ? null : (
      <View style={[tokenStyles.indicator, styles?.indicator]}>
        {resolvedIndicator}
      </View>
    );

  const textNode = hasText ? (
    <Text
      color={variantConfig.textColor}
      size={variantConfig.textSize}
      style={styles?.text}
    >
      {text}
    </Text>
  ) : null;

  const descriptionNode = hasDescription ? (
    <Text color="tertiary" size="xs" style={tokenStyles.description}>
      {description}
    </Text>
  ) : null;

  const textBlock =
    hasText || hasDescription ? (
      <Column align="center" style={tokenStyles.textBlock}>
        {textNode}
        {descriptionNode}
      </Column>
    ) : null;

  if (variant === 'overlay') {
    return (
      <View style={[tokenStyles.overlay, style]}>
        <Column
          align="center"
          gap={variantConfig.gap(token)}
          style={tokenStyles.overlayCard}
        >
          {indicatorNode}
          {textBlock}
        </Column>
      </View>
    );
  }

  if (variant === 'block') {
    return (
      <Column
        align="center"
        gap={variantConfig.gap(token)}
        style={[tokenStyles.block, style]}
      >
        {indicatorNode}
        {textBlock}
      </Column>
    );
  }

  return (
    <Row
      align="center"
      gap={variantConfig.gap(token)}
      style={[
        variant === 'more' ? tokenStyles.more : tokenStyles.inline,
        style,
      ]}
    >
      {indicatorNode}
      {textNode}
      {variant === 'more' ? descriptionNode : null}
    </Row>
  );
}
