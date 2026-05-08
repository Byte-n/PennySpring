import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useTheme } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type {
  SpaceAlign,
  SpaceDirection,
  SpaceJustify,
  SpaceProps,
  SpaceSize,
} from './types';

interface SpaceStyleOptions {
  align?: SpaceAlign;
  block: boolean;
  direction: SpaceDirection;
  justify?: SpaceJustify;
  wrap: boolean;
}

interface SpaceItemStyleOptions {
  direction: SpaceDirection;
  gap: number;
  isLast: boolean;
  wrap: boolean;
}

function getGap(size: SpaceSize, token: AliasToken) {
  if (size === 'small') {
    return token.marginXXS;
  }

  if (size === 'large') {
    return token.marginSM;
  }

  return token.marginXS;
}

function resolveSize(size?: SpaceSize): SpaceSize {
  return size ?? 'normal';
}

function resolveDirection(direction?: SpaceDirection): SpaceDirection {
  return direction ?? 'horizontal';
}

function mapFlexStartEnd(value?: 'start' | 'end' | 'center') {
  if (value === 'start') {
    return 'flex-start';
  }

  if (value === 'end') {
    return 'flex-end';
  }

  return value;
}

function mapAlignItems(align?: SpaceAlign): ViewStyle['alignItems'] {
  if (align === 'baseline') {
    return 'baseline';
  }

  return mapFlexStartEnd(align);
}

function mapJustifyContent(justify?: SpaceJustify): ViewStyle['justifyContent'] {
  if (justify === 'between') {
    return 'space-between';
  }

  if (justify === 'around') {
    return 'space-around';
  }

  if (justify === 'evenly') {
    return 'space-evenly';
  }

  if (justify === 'stretch') {
    return undefined;
  }

  return mapFlexStartEnd(justify);
}

function getValidChildren(children: React.ReactNode) {
  return React.Children.toArray(children).filter((child) => {
    return child !== null && child !== undefined;
  });
}

const useSpaceStyles = createUseSheetStyle(
  (_token, options: SpaceStyleOptions) => ({
    root: {
      alignItems: mapAlignItems(options.align),
      alignSelf: options.block ? 'stretch' : undefined,
      flexDirection: options.direction === 'vertical' ? 'column' : 'row',
      flexWrap:
        options.direction === 'horizontal' && options.wrap ? 'wrap' : undefined,
      justifyContent: mapJustifyContent(options.justify),
    },
    item: {
      flexShrink: 0,
    },
  }),
);

const useSpaceItemStyles = createUseSheetStyle(
  (_token, options: SpaceItemStyleOptions) => {
    const style: ViewStyle = {
      flexShrink: 0,
    };

    if (options.direction === 'vertical') {
      if (!options.isLast) {
        style.marginBottom = options.gap;
      }

      return {
        item: style,
      };
    }

    if (!options.isLast) {
      style.marginRight = options.gap;
    }

    if (options.wrap) {
      style.marginBottom = options.gap;
    }

    return {
      item: style,
    };
  },
);

interface SpaceItemProps {
  children: React.ReactNode;
  direction: SpaceDirection;
  gap: number;
  isLast: boolean;
  style?: SpaceProps['styles'];
  wrap: boolean;
}

function SpaceItem({
  children,
  direction,
  gap,
  isLast,
  style,
  wrap,
}: SpaceItemProps) {
  const tokenStyles = useSpaceItemStyles({
    direction,
    gap,
    isLast,
    wrap,
  });

  return <View style={[tokenStyles.item, style?.item]}>{children}</View>;
}

export function Space({
  align,
  block = false,
  children,
  direction,
  justify,
  size,
  style,
  styles,
  wrap = false,
}: SpaceProps) {
  const resolvedDirection = resolveDirection(direction);
  const resolvedSize = resolveSize(size);
  const tokenStyles = useSpaceStyles({
    align,
    block,
    direction: resolvedDirection,
    justify,
    wrap,
  });
  const { token } = useTheme();
  const gap = getGap(resolvedSize, token);
  const validChildren = getValidChildren(children);

  return (
    <View style={[tokenStyles.root, style]}>
      {validChildren.map((child, index) => (
        <SpaceItem
          key={(child as React.ReactElement).key ?? String(index)}
          direction={resolvedDirection}
          gap={gap}
          isLast={index === validChildren.length - 1}
          style={styles}
          wrap={wrap}
        >
          {child}
        </SpaceItem>
      ))}
    </View>
  );
}
