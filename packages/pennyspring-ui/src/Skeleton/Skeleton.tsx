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
  SHIMMER_DURATION,
  SHIMMER_WIDTH_RATIO,
  useStyles,
} from './style';

/** 加载完成时内容淡入；骨架占位不再额外撑高，避免布局跳动。 */
function ContentFade({
  animate,
  children,
  style,
}: {
  animate: boolean;
  children: React.ReactNode;
  style: object;
}) {
  const { token } = useTheme();
  const opacity = useSharedValue(animate ? 0 : 1);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  React.useEffect(() => {
    if (!animate) {
      return;
    }

    opacity.value = withTiming(1, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }, [animate, opacity, token.motionDurationFast, token.motionEaseOut]);

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

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
  const [containerWidth, setContainerWidth] = React.useState(0);
  const wasLoadingRef = React.useRef(loading);
  const placeholderHeightRef = React.useRef(0);
  const shouldFadeIn = wasLoadingRef.current && !loading;
  const resolvedHeight = getDefaultHeight(shape, size);
  const resolvedWidth = getDefaultWidth(shape, size);
  const resolvedBorderRadius = getDefaultBorderRadius(shape, token, size, resolvedHeight);
  const shimmerWidth = containerWidth * SHIMMER_WIDTH_RATIO;

  const tokenStyles = useStyles({
    borderRadius: resolvedBorderRadius,
    fadeMinHeight: placeholderHeightRef.current,
    height: resolvedHeight,
    shimmerWidth,
    width: resolvedWidth,
  });

  React.useEffect(() => {
    wasLoadingRef.current = loading;
  }, [loading]);

  if (!loading) {
    return (
      <ContentFade animate={shouldFadeIn} style={tokenStyles.fade}>
        {children}
      </ContentFade>
    );
  }

  return (
    <View
      onLayout={event => {
        const { height, width } = event.nativeEvent.layout;
        placeholderHeightRef.current = height;
        setContainerWidth(width);
      }}
      style={[tokenStyles.root, externalStyles?.root, style]}
    >
      {animated ? (
        <ShimmerAnimation
          containerWidth={containerWidth}
          duration={SHIMMER_DURATION}
          easing={Easing.bezier(...token.motionEaseInOut)}
          shimmerStyle={tokenStyles.shimmer}
          shimmerWidth={shimmerWidth}
        />
      ) : null}
    </View>
  );
}

interface ShimmerAnimationProps {
  containerWidth: number;
  shimmerStyle: object;
  duration: number;
  easing: ReturnType<typeof Easing.bezier>;
  shimmerWidth: number;
}

function ShimmerAnimation({
  containerWidth,
  shimmerStyle,
  duration,
  easing,
  shimmerWidth,
}: ShimmerAnimationProps) {
  const translateX = useSharedValue(-shimmerWidth);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  React.useEffect(() => {
    if (containerWidth <= 0 || shimmerWidth <= 0) {
      return;
    }

    translateX.value = -shimmerWidth;
    translateX.value = withRepeat(
      withTiming(containerWidth, { duration, easing }),
      -1,
      false,
    );
  }, [containerWidth, duration, easing, shimmerWidth, translateX]);

  return <Animated.View style={[shimmerStyle, animatedStyle]} />;
}
