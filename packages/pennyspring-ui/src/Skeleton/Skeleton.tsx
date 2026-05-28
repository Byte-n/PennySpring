import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import type { SkeletonProps } from './types';
import {
  getDefaultBorderRadius,
  getDefaultHeight,
  getDefaultWidth,
  useStyles,
} from './style';

const SHIMMER_TRANSLATE_START = -100;
const SHIMMER_TRANSLATE_END = 200;

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
    <View style={[tokenStyles.root, externalStyles?.root, style]}>
      {animated ? (
        <ShimmerAnimation
          shimmerStyle={tokenStyles.shimmer}
          duration={token.motionDurationSlow}
          easing={Easing.bezier(...token.motionEaseInOut)}
        />
      ) : null}
    </View>
  );
}

function ShimmerAnimation({
  shimmerStyle,
  duration,
  easing,
}: {
  shimmerStyle: object;
  duration: number;
  easing: ReturnType<typeof Easing.bezier>;
}) {
  const translateX = useSharedValue(SHIMMER_TRANSLATE_START);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${translateX.value}%` }],
  }));

  React.useEffect(() => {
    translateX.value = withRepeat(
      withTiming(SHIMMER_TRANSLATE_END, { duration, easing }),
      -1,
      false,
    );
  }, [translateX, duration, easing]);

  return (
    <Animated.View
      style={[shimmerStyle, animatedStyle]}
    />
  );
}
