import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type {
  AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import type { BadgeColor,
  BadgeProps,
} from './types';

interface BadgeStyleOptions {
  color: BadgeColor;
  hasChildren: boolean;
  isDot: boolean;
  offset: BadgeOffset;
  size: ComponentSize;
}

interface SizeStyleConfig {
  height: (token: AliasToken) => number;
  dotSize: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  offsetTop: (token: AliasToken) => number;
  offsetRight: (token: AliasToken) => number;
}

interface ColorStyleConfig {
  base: string;
}

type BadgeOffset = NonNullable<BadgeProps['offset']>;

interface ResolvedBadgeOffset {
  x: number;
  y: number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: token => token.size,
    dotSize: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    paddingHorizontal: token => token.paddingXXS,
    offsetTop: token => token.marginXXS,
    offsetRight: token => token.marginXXS,
  },
  normal: {
    height: token => token.sizeMD,
    dotSize: token => token.sizeXS,
    fontSize: token => token.fontSizeSM,
    paddingHorizontal: token => token.paddingXS,
    offsetTop: token => token.marginXS,
    offsetRight: token => token.marginXS,
  },
  large: {
    height: token => token.controlHeightXS,
    dotSize: token => token.sizeSM,
    fontSize: token => token.fontSize,
    paddingHorizontal: token => token.paddingSM,
    offsetTop: token => token.marginSM,
    offsetRight: token => token.marginSM,
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

const BADGE_ANCHOR_OFFSET_RATIO = 2;

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
    return 99;
  }

  if (!Number.isFinite(overflowCount) || overflowCount < 0) {
    return 99;
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
    const indicatorHeight = sizeConfig.height(token);
    const dotSize = sizeConfig.dotSize(token);
    const resolvedOffset = resolveBadgeOffset(offset);
    const childTranslateX = isDot
      ? dotSize / BADGE_ANCHOR_OFFSET_RATIO + resolvedOffset.x
      : sizeConfig.offsetRight(token) + resolvedOffset.x;
    const childTranslateY = isDot
      ? -(dotSize / BADGE_ANCHOR_OFFSET_RATIO) + resolvedOffset.y
      : -sizeConfig.offsetTop(token) + resolvedOffset.y;

    return {
      root: {
        alignSelf: 'flex-start',
        position: 'relative',
      },
      contentWrapper: {
        alignSelf: 'flex-start',
      },
      indicator: {
        alignItems: 'center',
        backgroundColor: colorConfig.base,
        borderRadius: indicatorHeight,
        justifyContent: 'center',
        minHeight: isDot ? dotSize : indicatorHeight,
        minWidth: isDot ? dotSize : indicatorHeight,
        paddingHorizontal: isDot ? 0 : sizeConfig.paddingHorizontal(token),
        ...(hasChildren
          ? {
            position: 'absolute',
            right: 0,
            top: 0,
            transform: [
              { translateX: childTranslateX },
              { translateY: childTranslateY },
            ],
            zIndex: token.zIndexBase + 1,
          }
          : null),
      },
      dot: {
        borderRadius: dotSize,
        height: dotSize,
        width: dotSize,
      },
      content: {
        color: token.colorTextLightSolid,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
        lineHeight: indicatorHeight,
      },
    };
  },
);

function isPrimitiveContent(content: unknown): content is string | number {
  return typeof content === 'string' || typeof content === 'number';
}

function renderBadgeContent(
  content: BadgeProps['count'],
  badgeStyles: BadgeProps['styles'],
  tokenContentStyle: ReturnType<typeof useStyles>['content'],
): React.ReactNode {
  if (isPrimitiveContent(content)) {
    return (
      <Text style={[tokenContentStyle, badgeStyles?.content]}>
        {content}
      </Text>
    );
  }

  return content;
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

  if (!shouldRender) {
    return null;
  }

  const displayCount = resolveDisplayCount(count, normalizedOverflowCount);
  const badgeNode = (
    <View style={[tokenStyles.indicator, styles?.indicator]}>
      {dot ? <View style={[tokenStyles.dot, styles?.dot]} /> : renderBadgeContent(displayCount, styles, tokenStyles.content)}
    </View>
  );

  return (
    <View {...rest} style={[tokenStyles.root, style]}>
      {hasChildren ? <View style={tokenStyles.contentWrapper}>{children}</View> : null}
      {badgeNode}
    </View>
  );
}
