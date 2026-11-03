import React, { useEffect, useMemo, useState } from 'react';
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
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

const AnimatedView = createAnimatedComponent(View);
const SWEEP_CYCLE_MS = 4800;
const SWEEP_DEGREES = 54;
const RING_FACTORS = [0.16, 0.32, 0.48, 0.64, 0.8, 0.96];
const RING_OPACITIES = [1, 0.9, 0.78, 0.62, 0.46, 0.3];

interface RadarLayout {
  width: number;
  height: number;
  radius: number;
}

interface LanRadarProps {
  paused?: boolean;
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
    borderRadius: layout.radius,
  },
  hidden: {
    opacity: 0,
  },
  svg: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
}));

export function LanRadar({ paused = false }: LanRadarProps) {
  const { token } = useTheme();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const rotation = useSharedValue(0);

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
  const sweepRadians = (SWEEP_DEGREES * Math.PI) / 180;

  useEffect(() => {
    if (paused || reduceMotion) {
      cancelAnimation(rotation);
      return;
    }

    rotation.value = withRepeat(
      withTiming(360, {
        duration: SWEEP_CYCLE_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [paused, reduceMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleLayout = (event: LayoutChangeEvent): void => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View onLayout={handleLayout} pointerEvents="none" style={styles.root}>
      {layout.width > 1 && layout.height > 1 ? (
        <>
          <Svg
            height={layout.height}
            style={styles.svg}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
          >
            {RING_FACTORS.map((factor, index) => (
              <Circle
                cx={layout.width / 2}
                cy={layout.height}
                fill="none"
                key={factor}
                opacity={RING_OPACITIES[index]}
                r={layout.radius * factor}
                stroke={token.colorBorder}
                strokeWidth={token.lineWidth}
              />
            ))}
            <Line
              opacity={0.5}
              stroke={token.colorBorder}
              strokeWidth={token.lineWidth}
              x1={layout.width / 2}
              x2={layout.width / 2 - layout.radius * 0.7}
              y1={layout.height}
              y2={layout.height * 0.18}
            />
            <Line
              opacity={0.35}
              stroke={token.colorBorder}
              strokeWidth={token.lineWidth}
              x1={layout.width / 2}
              x2={layout.width / 2 + layout.radius * 0.7}
              y1={layout.height}
              y2={layout.height * 0.18}
            />
          </Svg>

          <AnimatedView
            pointerEvents="none"
            style={[styles.sweep, paused ? styles.hidden : undefined]}
          >
            <AnimatedView style={[styles.root, animatedStyle]}>
              <Svg height={layout.radius * 2} width={layout.radius * 2}>
                <Path
                  d={`M ${layout.radius} ${layout.radius} L ${layout.radius} 0 L ${
                    layout.radius + layout.radius * Math.sin(sweepRadians)
                  } ${layout.radius - layout.radius * Math.cos(sweepRadians)} Z`}
                  fill={token.colorPrimary}
                  fillOpacity={0.14}
                />
                <Line
                  opacity={0.55}
                  stroke={token.colorPrimary}
                  strokeWidth={token.lineWidth}
                  x1={layout.radius}
                  x2={layout.radius}
                  y1={layout.radius}
                  y2={0}
                />
              </Svg>
            </AnimatedView>
          </AnimatedView>
        </>
      ) : null}
    </View>
  );
}
