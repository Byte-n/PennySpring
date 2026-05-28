import type { ComponentSize } from '../shares/types';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { SliderProps } from './types';

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;


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

export function Slider({
  defaultValue,
  disabled = false,
  max = DEFAULT_MAX,
  min = DEFAULT_MIN,
  onChange,
  readonly = false,
  size = 'normal',
  step = DEFAULT_STEP,
  style,
  styles,
  value,
}: SliderProps) {
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
    value === undefined
      ? undefined
      : normalizeValue(value, safeMin, safeMax, safeStep);
  const [internalValue, setInternalValue] = useControllableValue(
    normalizedDefaultValue,
    normalizedControlledValue,
    onChange,
  );
  const [trackWidth, setTrackWidth] = useState(0);
  const isReadOnly = disabled || readonly;
  const currentValue = normalizeValue(
    internalValue ?? safeMin,
    safeMin,
    safeMax,
    safeStep,
  );
  const progress = safeMax === safeMin ? 0 : (currentValue - safeMin) / (safeMax - safeMin);
  const clampedProgress = clamp(progress, 0, 1);
  const tokenStyles = useStyles({
    disabled: disabled || readonly,
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

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!isReadOnly)
        .runOnJS(true)
        .minDistance(0)
        .onBegin((event) => {
          updateFromLocation(event.x);
        })
        .onUpdate((event) => {
          updateFromLocation(event.x);
        })
        .onEnd((event) => {
          updateFromLocation(event.x);
        }),
    [isReadOnly, trackWidth, safeMin, safeMax, safeStep, currentValue],
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
      <View
        pointerEvents="none"
        style={[tokenStyles.thumbContainer]}
      >
        <View testID="slider-thumb" style={[tokenStyles.thumb, styles?.thumb]} />
      </View>
    </View>
  );
}
