import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import {
  buildAreaPath,
  buildLinePath,
} from '../chartGeometry';
import type { NetWorthPoint } from '../analysisData';
import { useMeasuredWidth } from './useMeasuredWidth';

const VIEW_WIDTH = 311;
const VIEW_HEIGHT = 64;
const HEIGHT_RATIO = VIEW_HEIGHT / VIEW_WIDTH;
const PLOT_LEFT = 4;
const PLOT_RIGHT = 305;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 46;
const LABEL_Y = 60;
const RANGE_PADDING = 0.1;
const AREA_TOP_OPACITY = 0.18;
const AREA_BOTTOM_OPACITY = 0;
const DOT_RADIUS = 3;
const DOT_STROKE_WIDTH = 1.5;
const LINE_WIDTH = 2;

interface NetWorthSparklineProps {
  points: readonly NetWorthPoint[];
}

const useStyles = createUseSheetStyle(token => ({
  wrap: {
    width: '100%',
    minHeight: token.sizeXXL,
  },
}));

export function NetWorthSparkline({ points }: NetWorthSparklineProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const { width, onLayout } = useMeasuredWidth();

  if (points.length < 2) {
    return <View style={styles.wrap} onLayout={onLayout} />;
  }

  const values = points.map(point => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(Math.abs(max), 1);
  const paddedMin = min - range * RANGE_PADDING;
  const paddedMax = max + range * RANGE_PADDING;
  const last = points[points.length - 1];
  const useError = last.value < 0;
  const lineColor = useError ? token.colorError : token.colorPrimary;
  const x = (index: number) =>
    PLOT_LEFT +
    (index / (points.length - 1)) * (PLOT_RIGHT - PLOT_LEFT);
  const y = (value: number) =>
    PLOT_BOTTOM -
    ((value - paddedMin) / (paddedMax - paddedMin)) *
      (PLOT_BOTTOM - PLOT_TOP);
  const chartPoints = points.map((point, index) => ({
    x: x(index),
    y: y(point.value),
  }));
  const lastPoint = chartPoints[chartPoints.length - 1];

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={width * HEIGHT_RATIO} viewBox="0 0 311 64">
          <Defs>
            <LinearGradient id="netWorthArea" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={lineColor}
                stopOpacity={AREA_TOP_OPACITY}
              />
              <Stop
                offset="1"
                stopColor={lineColor}
                stopOpacity={AREA_BOTTOM_OPACITY}
              />
            </LinearGradient>
          </Defs>
          <Path
            d={buildAreaPath(chartPoints, PLOT_BOTTOM)}
            fill="url(#netWorthArea)"
          />
          <Path
            d={buildLinePath(chartPoints)}
            fill="none"
            stroke={lineColor}
            strokeWidth={LINE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={DOT_RADIUS}
            fill={lineColor}
            stroke={token.colorBgContainer}
            strokeWidth={DOT_STROKE_WIDTH}
          />
          <SvgText
            x={PLOT_LEFT}
            y={LABEL_Y}
            fontFamily={token.fontFamily}
            fontSize={token.fontSizeXS}
            fill={token.colorTextTertiary}
          >
            {points[0].label}
          </SvgText>
          <SvgText
            x={PLOT_RIGHT}
            y={LABEL_Y}
            textAnchor="end"
            fontFamily={token.fontFamily}
            fontSize={token.fontSizeXS}
            fill={token.colorTextTertiary}
          >
            {last.label}
          </SvgText>
        </Svg>
      ) : null}
    </View>
  );
}
