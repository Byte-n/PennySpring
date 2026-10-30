import React, { useEffect } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import {
  Easing,
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

const AnimatedView = createAnimatedComponent(View);
const PROGRESS_BAR_RATIO = 0.38;
/** AliasToken.motionDuration* 没有可用于不定进度条的档位。 */
const PROGRESS_CYCLE_MS = 1400;

const useStyles = createUseSheetStyle(token => ({
  track: {
    position: 'absolute' as const,
    top: 0,
    left: token.padding,
    right: token.padding,
    height: token.lineWidthBold,
    overflow: 'hidden' as const,
    backgroundColor: token.colorFillContent,
    borderRadius: token.borderRadiusXS,
  },
  bar: {
    width: `${PROGRESS_BAR_RATIO * 100}%`,
    height: '100%',
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusXS,
  },
}));

export function ComposerRunningProgress(): React.ReactElement {
  const styles = useStyles();
  const { token } = useTheme();
  const progress = useSharedValue(0);
  const trackWidth = useSharedValue(0);
  const easing = token.motionEaseInOut;

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: PROGRESS_CYCLE_MS,
        easing: Easing.bezier(...easing),
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(progress);
    };
  }, [easing, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const width = trackWidth.value;
    const barWidth = width * PROGRESS_BAR_RATIO;

    return {
      transform: [
        { translateX: -barWidth + progress.value * (width + barWidth) },
      ],
    };
  });

  function handleLayout(event: LayoutChangeEvent): void {
    trackWidth.value = event.nativeEvent.layout.width;
  }

  return (
    <View onLayout={handleLayout} pointerEvents="none" style={styles.track}>
      <AnimatedView style={[styles.bar, animatedStyle]} />
    </View>
  );
}
