import React from 'react';
import { Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import Svg, { Circle } from 'react-native-svg';

const DONUT_SIZE = 140;
const DONUT_CENTER = 70;
const DONUT_RADIUS = 54;
const DONUT_STROKE = 18;
const DONUT_GAP = 2.4;
const DONUT_MIN_SLICE = 0.6;
const DONUT_START_ANGLE = -90;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

export interface DonutSlice {
  key: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: readonly DonutSlice[];
  centerLabel: string;
  centerValue: string;
  centerSub?: string;
}

const useStyles = createUseSheetStyle(token => ({
  wrap: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    alignSelf: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
  },
  value: {
    marginTop: token.marginXXS,
  },
  sub: {
    marginTop: token.marginXXS,
  },
}));

export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  centerSub,
}: DonutChartProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Column style={styles.wrap}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox="0 0 140 140">
        <Circle
          cx={DONUT_CENTER}
          cy={DONUT_CENTER}
          r={DONUT_RADIUS}
          fill="none"
          stroke={token.colorFillSecondary}
          strokeWidth={DONUT_STROKE}
        />
        {total > 0
          ? slices.map((slice, index) => {
              const length = (slice.value / total) * CIRCUMFERENCE;
              const before = slices
                .slice(0, index)
                .reduce((sum, item) => sum + (item.value / total) * CIRCUMFERENCE, 0);
              const dash = Math.max(length - DONUT_GAP, DONUT_MIN_SLICE);
              return (
                <Circle
                  key={slice.key}
                  cx={DONUT_CENTER}
                  cy={DONUT_CENTER}
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={DONUT_STROKE}
                  strokeDasharray={[dash, CIRCUMFERENCE - dash]}
                  strokeDashoffset={-before}
                  rotation={DONUT_START_ANGLE}
                  originX={DONUT_CENTER}
                  originY={DONUT_CENTER}
                />
              );
            })
          : null}
      </Svg>
      <Column style={styles.center}>
        <Text size="xs" color="tertiary">
          {centerLabel}
        </Text>
        <Text
          size="lg"
          weight="semibold"
          numberOfLines={1}
          style={styles.value}
        >
          {centerValue}
        </Text>
        {centerSub ? (
          <Text
            size="xs"
            color="tertiary"
            numberOfLines={1}
            style={styles.sub}
          >
            {centerSub}
          </Text>
        ) : null}
      </Column>
    </Column>
  );
}
