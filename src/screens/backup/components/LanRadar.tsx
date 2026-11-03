import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import {
  Easing,
  cancelAnimation,
  createAnimatedComponent,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

const AnimatedView = createAnimatedComponent(View);
const SWEEP_PASS_MS = 4000;
const SWEEP_START_DEGREES = -90;
const SWEEP_END_DEGREES = 90;
const TRAIL_DEGREES = 64;
const TRAIL_SLICES = 48;
const TRAIL_MAX_OPACITY = 0.32;
const BREATHE_CYCLE_MS = 1700;
const RING_STAGGER_MS = 140;
const RING_BREATHE_MIN = 0.42;
const RING_BREATHE_SCALE = 0.02;
const PULSE_DURATION_MS = 750;
const PULSE_DIAMETER = 760;
const PULSE_MIN_SCALE = 0.03;
const RING_FACTORS = [0.16, 0.32, 0.48, 0.64, 0.8, 0.96];
const RING_OPACITIES = [1, 0.9, 0.78, 0.62, 0.46, 0.3];
const SPOKE_ANGLE = 0.7;

interface RadarLayout {
  width: number;
  height: number;
  radius: number;
}

interface LanRadarProps {
  paused?: boolean;
  peerCount?: number;
}

interface RadarRingProps {
  baseOpacity: number;
  breathe: SharedValue<number>;
  height: number;
  index: number;
  radius: number;
  reduceMotion: boolean;
  width: number;
}

interface RingLayout {
  height: number;
  radius: number;
  width: number;
}

const useStyles = createUseSheetStyle((token, layout: RadarLayout) => ({
  root: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sweep: {
    position: 'absolute' as const,
    width: layout.radius * 2,
    height: layout.radius * 2,
    left: layout.width / 2 - layout.radius,
    top: layout.height - layout.radius,
  },
  pulse: {
    position: 'absolute' as const,
    width: PULSE_DIAMETER,
    height: PULSE_DIAMETER,
    left: layout.width / 2 - PULSE_DIAMETER / 2,
    top: layout.height - PULSE_DIAMETER / 2,
    borderRadius: PULSE_DIAMETER / 2,
    borderWidth: token.lineWidth,
    borderColor: token.colorPrimary,
  },
  svg: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
}));

const useRingStyles = createUseSheetStyle((token, layout: RingLayout) => ({
  ring: {
    position: 'absolute' as const,
    width: layout.radius * 2,
    height: layout.radius * 2,
    left: layout.width / 2 - layout.radius,
    top: layout.height - layout.radius,
    borderRadius: layout.radius,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
  },
}));

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function buildTrail(radius: number): { d: string; opacity: number }[] {
  const half = TRAIL_DEGREES / 2;
  const step = TRAIL_DEGREES / TRAIL_SLICES;
  const slices: { d: string; opacity: number }[] = [];

  for (let index = 0; index < TRAIL_SLICES; index += 1) {
    const from = -half + index * step;
    const to = from + step;
    const fromX = radius + radius * Math.sin(toRadians(from));
    const fromY = radius - radius * Math.cos(toRadians(from));
    const toX = radius + radius * Math.sin(toRadians(to));
    const toY = radius - radius * Math.cos(toRadians(to));

    slices.push({
      d: `M ${radius} ${radius} L ${fromX} ${fromY} A ${radius} ${radius} 0 0 1 ${toX} ${toY} Z`,
      opacity: TRAIL_MAX_OPACITY * (1 - Math.abs(from + step / 2) / half),
    });
  }

  return slices;
}

function RadarRing({
  baseOpacity,
  breathe,
  height,
  index,
  radius,
  reduceMotion,
  width,
}: RadarRingProps) {
  const ringLayout = useMemo<RingLayout>(
    () => ({ height, radius, width }),
    [height, radius, width],
  );
  const styles = useRingStyles(ringLayout);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { opacity: baseOpacity, transform: [{ scale: 1 }] };
    }

    const offset = index * (RING_STAGGER_MS / BREATHE_CYCLE_MS);
    const shifted = (breathe.value - offset) % 1;
    const phase = shifted < 0 ? shifted + 1 : shifted;
    const wave = 0.5 - 0.5 * Math.cos(phase * 2 * Math.PI);

    return {
      opacity: baseOpacity * (RING_BREATHE_MIN + (1 - RING_BREATHE_MIN) * wave),
      transform: [{ scale: 1 + RING_BREATHE_SCALE * wave }],
    };
  });

  return <AnimatedView style={[styles.ring, animatedStyle]} />;
}

export function LanRadar({ paused = false, peerCount = 0 }: LanRadarProps) {
  const { token } = useTheme();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const rotation = useSharedValue(0);
  const fade = useSharedValue(1);
  const breathe = useSharedValue(0);
  const pulse = useSharedValue(0);
  const knownPeerCount = useRef(0);
  const gradientId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const layout = useMemo<RadarLayout>(() => {
    const width = Math.max(size.width, 1);
    const height = Math.max(size.height, 1);
    return {
      width,
      height,
      radius: Math.hypot(width / 2, height),
    };
  }, [size.height, size.width]);

  const styles = useStyles(layout);
  const trail = useMemo(() => buildTrail(layout.radius), [layout.radius]);

  useEffect(() => {
    if (paused || reduceMotion) {
      cancelAnimation(rotation);
      return undefined;
    }

    rotation.value = SWEEP_START_DEGREES;
    rotation.value = withRepeat(
      withTiming(SWEEP_END_DEGREES, {
        duration: SWEEP_PASS_MS,
        easing: Easing.linear,
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [paused, reduceMotion, rotation]);

  useEffect(() => {
    fade.value = withTiming(paused ? 0 : 1, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }, [paused, fade, token.motionDurationMid, token.motionEaseOut]);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(breathe);
      breathe.value = 0;
      return undefined;
    }

    breathe.value = withRepeat(
      withTiming(1, { duration: BREATHE_CYCLE_MS, easing: Easing.linear }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(breathe);
    };
  }, [breathe, reduceMotion]);

  useEffect(() => {
    const previous = knownPeerCount.current;
    knownPeerCount.current = peerCount;
    if (reduceMotion || peerCount <= previous) {
      return;
    }

    pulse.value = 0;
    pulse.value = withTiming(1, {
      duration: PULSE_DURATION_MS,
      easing: Easing.bezier(0.2, 0.7, 0.3, 1),
    });
  }, [peerCount, pulse, reduceMotion]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }));

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - pulse.value),
    transform: [
      { scale: PULSE_MIN_SCALE + pulse.value * (1 - PULSE_MIN_SCALE) },
    ],
  }));

  const handleLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const spokeLeftX = layout.width / 2 - layout.radius * SPOKE_ANGLE;
  const spokeRightX = layout.width / 2 + layout.radius * SPOKE_ANGLE;
  const spokeTopY = layout.height * 0.18;

  return (
    <View onLayout={handleLayout} pointerEvents="none" style={styles.root}>
      {layout.width > 1 && layout.height > 1 ? (
        <AnimatedView style={[styles.root, fadeStyle]}>
          <Svg
            height={layout.height}
            style={styles.svg}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
          >
            <Defs>
              <RadialGradient
                cx={layout.width / 2}
                cy={layout.height}
                gradientUnits="userSpaceOnUse"
                id={`${gradientId}-fill`}
                r={layout.radius}
              >
                <Stop
                  offset={0}
                  stopColor={token.colorPrimary}
                  stopOpacity={0.09}
                />
                <Stop
                  offset={0.64}
                  stopColor={token.colorPrimary}
                  stopOpacity={0}
                />
                <Stop
                  offset={1}
                  stopColor={token.colorPrimary}
                  stopOpacity={0}
                />
              </RadialGradient>
              <LinearGradient
                gradientUnits="userSpaceOnUse"
                id={`${gradientId}-spoke-left`}
                x1={layout.width / 2}
                x2={spokeLeftX}
                y1={layout.height}
                y2={spokeTopY}
              >
                <Stop
                  offset={0}
                  stopColor={token.colorBorder}
                  stopOpacity={0.55}
                />
                <Stop
                  offset={1}
                  stopColor={token.colorBorder}
                  stopOpacity={0}
                />
              </LinearGradient>
              <LinearGradient
                gradientUnits="userSpaceOnUse"
                id={`${gradientId}-spoke-right`}
                x1={layout.width / 2}
                x2={spokeRightX}
                y1={layout.height}
                y2={spokeTopY}
              >
                <Stop
                  offset={0}
                  stopColor={token.colorBorder}
                  stopOpacity={0.4}
                />
                <Stop
                  offset={1}
                  stopColor={token.colorBorder}
                  stopOpacity={0}
                />
              </LinearGradient>
            </Defs>
            <Circle
              cx={layout.width / 2}
              cy={layout.height}
              fill={`url(#${gradientId}-fill)`}
              r={layout.radius}
            />
            <Line
              stroke={`url(#${gradientId}-spoke-left)`}
              strokeWidth={token.lineWidth}
              x1={layout.width / 2}
              x2={spokeLeftX}
              y1={layout.height}
              y2={spokeTopY}
            />
            <Line
              stroke={`url(#${gradientId}-spoke-right)`}
              strokeWidth={token.lineWidth}
              x1={layout.width / 2}
              x2={spokeRightX}
              y1={layout.height}
              y2={spokeTopY}
            />
          </Svg>

          {RING_FACTORS.map((factor, index) => (
            <RadarRing
              baseOpacity={RING_OPACITIES[index]}
              breathe={breathe}
              height={layout.height}
              index={index}
              key={factor}
              radius={layout.radius * factor}
              reduceMotion={reduceMotion}
              width={layout.width}
            />
          ))}

          <AnimatedView style={[styles.sweep, rotationStyle]}>
            <Svg height={layout.radius * 2} width={layout.radius * 2}>
              <Defs>
                <LinearGradient
                  gradientUnits="userSpaceOnUse"
                  id={`${gradientId}-sweep-line`}
                  x1={layout.radius}
                  x2={layout.radius}
                  y1={layout.radius}
                  y2={0}
                >
                  <Stop
                    offset={0}
                    stopColor={token.colorPrimary}
                    stopOpacity={0}
                  />
                  <Stop
                    offset={0.58}
                    stopColor={token.colorPrimary}
                    stopOpacity={0.85}
                  />
                  <Stop
                    offset={0.86}
                    stopColor={token.colorPrimary}
                    stopOpacity={0.85}
                  />
                  <Stop
                    offset={1}
                    stopColor={token.colorPrimary}
                    stopOpacity={0}
                  />
                </LinearGradient>
              </Defs>
              {trail.map(slice => (
                <Path
                  d={slice.d}
                  fill={token.colorPrimary}
                  fillOpacity={slice.opacity}
                  key={slice.d}
                />
              ))}
              <Line
                stroke={`url(#${gradientId}-sweep-line)`}
                strokeWidth={token.lineWidthBold}
                x1={layout.radius}
                x2={layout.radius}
                y1={layout.radius}
                y2={0}
              />
            </Svg>
          </AnimatedView>

          <AnimatedView style={[styles.pulse, pulseStyle]} />
        </AnimatedView>
      ) : null}
    </View>
  );
}
