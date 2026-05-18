import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import type {
  DimensionValue } from 'react-native';
import Animated,
  {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  } from 'react-native-reanimated';
import { createUseSheetStyle,
  useTheme } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { SkeletonProps,
  SkeletonShape,
} from './types';

function getDefaultWidth(shape: SkeletonShape, token: AliasToken): DimensionValue {
  return shape === 'circle' ? token.controlHeightSM : '100%';
}

function getDefaultHeight(shape: SkeletonShape, size: ComponentSize, token: AliasToken): number {
  if (shape === 'line') {
    if (size === 'small') {
      return token.fontSizeSM;
    }

    if (size === 'large') {
      return token.fontSizeLG;
    }

    return token.fontSize;
  }

  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  switch (shape) {
    case 'circle':
    case 'rect':
    default:
      return token.controlHeight;
  }
}

function getDefaultBorderRadius(shape: SkeletonShape, token: AliasToken, height: number): number {
  switch (shape) {
    case 'circle':
      return height / 2;
    case 'rect':
      return token.borderRadius;
    case 'line':
    default:
      return token.borderRadiusSM;
  }
}

interface SkeletonStyleOptions {
  width: DimensionValue;
  height: number;
  borderRadius: number;
}

const useStyles = createUseSheetStyle(
  (token, { width, height, borderRadius }: SkeletonStyleOptions) => ({
    root: {
      backgroundColor: token.colorFillContent,
      borderRadius,
      height,
      overflow: 'hidden' as const,
      width,
    },
    shimmer: {
      backgroundColor: token.colorFillContentHover,
      borderRadius,
      bottom: 0,
      left: 0,
      position: 'absolute' as const,
      right: 0,
      top: 0,
      width: '50%',
    },
  }),
);

export function Skeleton({
  shape = 'line',
  size = 'normal',
  animated = true,
  loading = true,
  style,
  styles: externalStyles,
  children,
}: SkeletonProps) {
  const { token } = useTheme();
  const resolvedHeight = getDefaultHeight(shape, size, token);
  const resolvedWidth = getDefaultWidth(shape, token);
  const resolvedBorderRadius = getDefaultBorderRadius(shape, token, resolvedHeight);

  const tokenStyles = useStyles({
    borderRadius: resolvedBorderRadius,
    height: resolvedHeight,
    width: resolvedWidth,
  });

  if (!loading) {
    return <>{children}</>;
  }

  return (
    <View style={[tokenStyles.root, externalStyles?.bone, style]}>
      {animated ? (
        <ShimmerAnimation
          borderRadius={tokenStyles.shimmer.borderRadius as number}
          duration={token.motionDurationSlow * token.lineWidthFocus}
        />
      ) : null}
    </View>
  );
}

function ShimmerAnimation({
  borderRadius,
  duration,
}: {
  borderRadius: number;
  duration: number;
}) {
  const translateX = useSharedValue(-100);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
  }));

  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(200, { duration }),
      -1,
      false,
    );
  }, [translateX]);

  return (
    <Animated.View
      style={[{ borderRadius }, animatedStyle]}
    />
  );
}
