import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import { Text } from '../Text';
import type { TextSize } from '../Text';
import type { BadgeColor, BadgeProps } from './types';

interface BadgeStyleOptions {
  color: BadgeColor;
  hasChildren: boolean;
  isDot: boolean;
  offset: BadgeOffset;
  size: ComponentSize;
}

interface SizeStyleConfig {
  height: number;
  dotSize: number;
  paddingHorizontal: number;
  textSize: TextSize;
}

interface ColorStyleConfig {
  base: string;
}

type BadgeOffset = NonNullable<BadgeProps['offset']>;

interface ResolvedBadgeOffset {
  x: number;
  y: number;
}

export const DEFAULT_OVERFLOW_COUNT = 99;

/** AliasToken 没有徽标档位；16 / 20 / 24 与圆点 6 / 8 / 10 为语义常量。 */
const BADGE_SMALL = 16;
const BADGE_NORMAL = 20;
const BADGE_LARGE = 24;
const BADGE_DOT_SMALL = 6;
const BADGE_DOT_NORMAL = 8;
const BADGE_DOT_LARGE = 10;
const ANCHOR_OFFSET_RATIO = 0.4;
const DOT_ANCHOR_OFFSET_RATIO = 0.5;

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: BADGE_SMALL,
    dotSize: BADGE_DOT_SMALL,
    paddingHorizontal: 5,
    textSize: 'xs',
  },
  normal: {
    height: BADGE_NORMAL,
    dotSize: BADGE_DOT_NORMAL,
    paddingHorizontal: 6,
    textSize: 'xs',
  },
  large: {
    height: BADGE_LARGE,
    dotSize: BADGE_DOT_LARGE,
    paddingHorizontal: 8,
    textSize: 'sm',
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

function resolveBadgeOffset(offset: BadgeProps['offset']): ResolvedBadgeOffset {
  if (Array.isArray(offset)) {
    return {
      x: offset[0],
      y: offset[1],
    };
  }

  return {
    x: offset ?? 0,
    y: offset ?? 0,
  };
}

function isPresetColor(color: BadgeColor): color is (typeof PRESET_COLORS)[number] {
  return PRESET_COLORS.includes(color as (typeof PRESET_COLORS)[number]);
}

function resolveColorConfig(token: AliasToken, color: BadgeColor): ColorStyleConfig {
  if (color === 'default') {
    return {
      base: token.colorText,
    };
  }

  if (color === 'primary') {
    return {
      base: token.colorPrimary,
    };
  }

  if (color === 'success') {
    return {
      base: token.colorSuccess,
    };
  }

  if (color === 'warning') {
    return {
      base: token.colorWarning,
    };
  }

  if (color === 'danger') {
    return {
      base: token.colorError,
    };
  }

  if (color === 'info') {
    return {
      base: token.colorInfo,
    };
  }

  if (isPresetColor(color)) {
    return {
      base: token[`${color}6`],
    };
  }

  return {
    base: token.colorError,
  };
}

function resolveNumericCount(
  count: number,
  overflowCount: number,
): string {
  if (count > overflowCount) {
    return `${overflowCount}+`;
  }

  return String(count);
}

function normalizeOverflowCount(overflowCount?: number): number {
  if (overflowCount === undefined) {
    return DEFAULT_OVERFLOW_COUNT;
  }

  if (!Number.isFinite(overflowCount) || overflowCount < 0) {
    return DEFAULT_OVERFLOW_COUNT;
  }

  return Math.floor(overflowCount);
}

function shouldRenderBadge(
  count: BadgeProps['count'],
  dot: boolean,
  showZero: boolean,
): boolean {
  if (dot) {
    if (typeof count === 'number' && count <= 0) {
      return false;
    }

    if (count === null) {
      return true;
    }

    return count !== false;
  }

  if (count === undefined || count === null || count === false) {
    return false;
  }

  if (typeof count === 'number' && count === 0 && !showZero) {
    return false;
  }

  return true;
}

function resolveDisplayCount(
  count: BadgeProps['count'],
  overflowCount: number,
): BadgeProps['count'] {
  if (typeof count === 'number') {
    return resolveNumericCount(count, overflowCount);
  }

  return count;
}

const useStyles = createUseSheetStyle(
  (token, { color, hasChildren, isDot, offset, size }: BadgeStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const colorConfig = resolveColorConfig(token, color);
    const indicatorHeight = sizeConfig.height;
    const dotSize = sizeConfig.dotSize;
    const resolvedOffset = resolveBadgeOffset(offset);
    const anchorSize = isDot ? dotSize : indicatorHeight;
    const anchorRatio = isDot
      ? DOT_ANCHOR_OFFSET_RATIO
      : ANCHOR_OFFSET_RATIO;
    const anchorTranslateX = anchorSize * anchorRatio + resolvedOffset.x;
    const anchorTranslateY = -anchorSize * anchorRatio + resolvedOffset.y;

    return {
      root: {
        alignSelf: 'flex-start',
        position: 'relative',
      },
      contentWrapper: {
        alignSelf: 'flex-start',
      },
      anchor: {
        borderRadius: indicatorHeight,
        ...(hasChildren
          ? {
            borderColor: token.colorBgContainer,
            borderWidth: token.lineWidthBold,
            position: 'absolute' as const,
            right: 0,
            top: 0,
            zIndex: token.zIndexBase + 1,
          }
          : null),
      },
      anchorOffset: {
        transform: [
          { translateX: anchorTranslateX },
          { translateY: anchorTranslateY },
        ],
      },
      indicator: {
        alignItems: 'center',
        backgroundColor: colorConfig.base,
        borderRadius: indicatorHeight,
        height: isDot ? dotSize : indicatorHeight,
        justifyContent: 'center',
        minWidth: isDot ? dotSize : indicatorHeight,
        paddingHorizontal: isDot ? 0 : sizeConfig.paddingHorizontal,
      },
      dot: {
        borderRadius: dotSize,
        height: dotSize,
        width: dotSize,
      },
      content: {
        fontVariant: ['tabular-nums' as const],
        lineHeight: indicatorHeight,
      },
    };
  },
);

function renderBadgeContent(
  content: BadgeProps['count'],
  badgeStyles: BadgeProps['styles'],
  tokenContentStyle: ReturnType<typeof useStyles>['content'],
  size: ComponentSize,
): React.ReactNode {
  return renderTextNode(content, (text) => (
    <Text
      color="lightSolid"
      size={SIZE_STYLE_MAP[size].textSize}
      style={[tokenContentStyle, badgeStyles?.content]}
      weight="semibold"
    >
      {text}
    </Text>
  ));
}

export function Badge({
  children,
  color = 'default',
  count,
  dot = false,
  offset = 0,
  overflowCount,
  size = 'normal',
  showZero = false,
  style,
  styles,
  ...rest
}: BadgeProps) {
  const hasChildren = children !== undefined && children !== null;
  const tokenStyles = useStyles({
    color,
    hasChildren,
    isDot: dot,
    offset,
    size,
  });
  const normalizedOverflowCount = normalizeOverflowCount(overflowCount);
  const shouldRender = shouldRenderBadge(count, dot, showZero);

  if (!shouldRender && !hasChildren) {
    return null;
  }

  const badgeIndicator = shouldRender
    ? (
      <View
        style={[tokenStyles.indicator, styles?.indicator]}
        testID="badge-indicator"
      >
        {dot
          ? <View style={[tokenStyles.dot, styles?.dot]} testID="badge-dot" />
          : renderBadgeContent(resolveDisplayCount(count, normalizedOverflowCount), styles, tokenStyles.content, size)}
      </View>
    )
    : null;

  const badgeNode = badgeIndicator === null
    ? null
    : (
      <View
        style={[
          tokenStyles.anchor,
          hasChildren ? tokenStyles.anchorOffset : undefined,
        ]}
        testID="badge-anchor"
      >
        {badgeIndicator}
      </View>
    );

  return (
    <View {...rest} style={[tokenStyles.root, style]}>
      {hasChildren ? <View style={tokenStyles.contentWrapper}>{children}</View> : null}
      {badgeNode}
    </View>
  );
}
