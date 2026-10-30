import type { ComponentSize } from '../shares/types';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useTheme } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { SliderProps } from './types';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

/** 按压时 thumb 放大 10%。 */
const PRESS_SCALE_DELTA = 0.1;


function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function resolveStep(step?: number): number {
  if (step === undefined || step <= 0) {
    return DEFAULT_STEP;
  }

  return step;
}

function normalizeValue(value: number, min: number, max: number, step: number): number {
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const clamped = clamp(value, safeMin, safeMax);
  const steps = Math.round((clamped - safeMin) / step);
  const snapped = safeMin + steps * step;

  return clamp(snapped, safeMin, safeMax);
}

export function Slider(rawProps: SliderProps) {
  const {
    defaultValue,
    max = DEFAULT_MAX,
    min = DEFAULT_MIN,
    onChange,
    size = 'normal',
    step = DEFAULT_STEP,
    style,
    styles,
    value,
    disabled,
    readonly,
  } = rawProps;
  const field = useFieldProps<number>({
    value,
    onChange,
    disabled,
    readonly,
  });
  const resolvedSize = resolveSize(size);
  const safeStep = resolveStep(step);
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const normalizedDefaultValue = normalizeValue(
    defaultValue ?? safeMin,
    safeMin,
    safeMax,
    safeStep,
  );
  const normalizedControlledValue =
    field.value === undefined
      ? undefined
      : normalizeValue(field.value, safeMin, safeMax, safeStep);
  const [internalValue, setInternalValue] = useControllableValue(
    normalizedDefaultValue,
    normalizedControlledValue,
    field.onChange,
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const { token } = useTheme();
  const pressProgress = useSharedValue(0);
  const resolvedDisabled = field.disabled === true;
  const resolvedReadonly = field.readonly === true;
  const isReadOnly = resolvedDisabled || resolvedReadonly;
  const currentValue = normalizeValue(
    internalValue ?? safeMin,
    safeMin,
    safeMax,
    safeStep,
  );
  const progress = safeMax === safeMin ? 0 : (currentValue - safeMin) / (safeMax - safeMin);
  const clampedProgress = clamp(progress, 0, 1);
  const tokenStyles = useStyles({
    disabled: isReadOnly,
    size: resolvedSize,
    progress: clampedProgress,
    trackWidth,
  });

  function updateFromLocation(locationX: number): void {
    if (isReadOnly || trackWidth <= 0) {
      return;
    }

    const ratio = clamp(locationX / trackWidth, 0, 1);
    const nextValue = normalizeValue(
      safeMin + ratio * (safeMax - safeMin),
      safeMin,
      safeMax,
      safeStep,
    );

    setInternalValue(nextValue);
  }

  function handleTrackLayout(event: { nativeEvent: { layout: { width: number } } }): void {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function setPressed(pressed: boolean): void {
    pressProgress.value = withTiming(pressed ? 1 : 0, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pressProgress.value * PRESS_SCALE_DELTA }],
  }));

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isReadOnly)
        .runOnJS(true)
        .minDistance(0)
        .onBegin((event) => {
          setPressed(true);
          updateFromLocation(event.x);
        })
        .onUpdate((event) => {
          updateFromLocation(event.x);
        })
        .onEnd((event) => {
          updateFromLocation(event.x);
        })
        .onFinalize(() => {
          setPressed(false);
        }),
    [
      isReadOnly,
      trackWidth,
      safeMin,
      safeMax,
      safeStep,
      currentValue,
      pressProgress,
      token.motionDurationFast,
      token.motionEaseOut,
    ],
  );

  return (
    <View style={[tokenStyles.root, style]}>
      <GestureDetector gesture={panGesture}>
        <View
          testID="slider-track"
          onLayout={handleTrackLayout}
          style={[tokenStyles.track, styles?.track]}
        >
          <View
            testID="slider-track-fill"
            style={[tokenStyles.trackFill, styles?.trackFill]}
          />
        </View>
      </GestureDetector>
      <View pointerEvents="none" style={[tokenStyles.thumbContainer]}>
        <Animated.View
          testID="slider-thumb"
          style={[
            tokenStyles.thumb,
            !isReadOnly ? tokenStyles.thumbRaised : null,
            resolvedDisabled ? tokenStyles.thumbDisabled : null,
            styles?.thumb,
            thumbAnimatedStyle,
          ]}
        />
      </View>
    </View>
  );
}
