import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import type {
  GestureResponderEvent,
  LayoutChangeEvent,
  ViewStyle,
} from 'react-native';
import type { SliderProps, SliderSize } from './types';

interface SliderStyleOptions {
  size: SliderSize;
  disabled: boolean;
}

interface SliderSizeConfig {
  height: (token: AliasToken) => number;
  thumbSize: (token: AliasToken) => number;
  trackHeight: (token: AliasToken) => number;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const DEFAULT_STEP = 1;

const SIZE_MAP: Record<SliderSize, SliderSizeConfig> = {
  small: {
    height: token => token.controlHeightSM,
    thumbSize: token => token.fontSize,
    trackHeight: token => token.lineWidthBold,
  },
  normal: {
    height: token => token.controlHeight,
    thumbSize: token => token.fontSizeXL,
    trackHeight: token => token.sizeXXS,
  },
  large: {
    height: token => token.controlHeightLG,
    thumbSize: token => token.fontSizeHeading5,
    trackHeight: token => token.sizeXS,
  },
};

function resolveSize(size?: SliderSize): SliderSize {
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

const useStyles = createUseSheetStyle(
  (token, { size, disabled }: SliderStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];

    return {
      root: {
        minHeight: sizeConfig.height(token),
        justifyContent: 'center',
      },
      track: {
        width: '100%',
        height: sizeConfig.trackHeight(token),
        borderRadius: token.borderRadiusSM,
        backgroundColor: disabled ? token.colorFillTertiary : token.colorFillSecondary,
        overflow: 'hidden',
      },
      trackFill: {
        height: '100%',
        borderRadius: token.borderRadiusSM,
        backgroundColor: disabled ? token.colorFillContent : token.colorPrimary,
      },
      thumbContainer: {
        position: 'absolute',
        top: '50%',
      },
      thumb: {
        width: sizeConfig.thumbSize(token),
        height: sizeConfig.thumbSize(token),
        marginTop: -sizeConfig.thumbSize(token) / 2,
        borderRadius: token.borderRadius,
        backgroundColor: disabled ? token.colorFillContent : token.colorBgContainer,
        borderWidth: token.lineWidth,
        borderColor: disabled ? token.colorBorderDisabled : token.colorPrimary,
      },
    };
  },
);

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
  const tokenStyles = useStyles({
    disabled: disabled || readonly,
    size: resolvedSize,
  });
  const isReadOnly = disabled || readonly;
  const currentValue = normalizeValue(
    internalValue ?? safeMin,
    safeMin,
    safeMax,
    safeStep,
  );
  const progress = safeMax === safeMin ? 0 : (currentValue - safeMin) / (safeMax - safeMin);
  const clampedProgress = clamp(progress, 0, 1);
  const trackFillStyle = useMemo<ViewStyle>(
    () => ({
      width: `${clampedProgress * 100}%`,
    }),
    [clampedProgress],
  );

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

  function handleTrackLayout(event: LayoutChangeEvent): void {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  function handlePress(event: GestureResponderEvent): void {
    updateFromLocation(event.nativeEvent.locationX);
  }

  return (
    <View style={[tokenStyles.root, style]}>
      <View
        testID="slider-track"
        onLayout={handleTrackLayout}
        onStartShouldSetResponder={() => !isReadOnly}
        onResponderGrant={handlePress}
        onResponderMove={handlePress}
        onResponderRelease={handlePress}
        style={[tokenStyles.track, styles?.track]}
      >
        <View
          testID="slider-track-fill"
          style={[tokenStyles.trackFill, trackFillStyle, styles?.trackFill]}
        />
      </View>
      <View
        pointerEvents="none"
        style={[
          tokenStyles.thumbContainer,
          {
            left: trackWidth * clampedProgress,
          },
        ]}
      >
        <View testID="slider-thumb" style={[tokenStyles.thumb, styles?.thumb]} />
      </View>
    </View>
  );
}
