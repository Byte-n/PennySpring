import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import type {
  SpaceDirection,
  SpaceProps,
} from './types';
import {
  getGap,
  resolveSize,
  resolveDirection,
  useSpaceStyles,
  useSpaceItemStyles,
} from './style';

function getValidChildren(children: React.ReactNode) {
  return React.Children.toArray(children).filter((child) => {
    return child !== null && child !== undefined;
  });
}

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
}: SpaceProps): React.JSX.Element {
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
