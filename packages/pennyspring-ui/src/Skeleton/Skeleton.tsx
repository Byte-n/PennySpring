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
          shimmerWidth={resolvedWidth === '100%' ? undefined : Number(resolvedWidth) / 2}
        />
      ) : null}
    </View>
  );
}

function ShimmerAnimation({
  shimmerStyle,
  duration,
  easing,
  shimmerWidth,
}: {
  shimmerStyle: object;
  duration: number;
  easing: ReturnType<typeof Easing.bezier>;
  shimmerWidth?: number;
}) {
  const translateX = useSharedValue(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const resolvedShimmerWidth = shimmerWidth ?? containerWidth / 2;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  React.useEffect(() => {
    if (containerWidth <= 0) {
      return;
    }

    translateX.value = -resolvedShimmerWidth;
    translateX.value = withRepeat(
      withTiming(containerWidth, { duration, easing }),
      -1,
      false,
    );
  }, [containerWidth, duration, easing, resolvedShimmerWidth, translateX]);

  return (
    <Animated.View
      onLayout={event => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}
      style={[shimmerStyle, animatedStyle]}
    />
  );
}
