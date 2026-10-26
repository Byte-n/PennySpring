import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Line,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import {
  buildAreaPath,
  buildAxis,
  buildLinePath,
} from '../../chartGeometry';
import { formatAxisMoney } from '../../analysisData';
import type { DailyExpensePoint } from '../../analysisData';
import { useMeasuredWidth } from '../useMeasuredWidth';

const VIEW_WIDTH = 311;
const VIEW_HEIGHT = 152;
const HEIGHT_RATIO = VIEW_HEIGHT / VIEW_WIDTH;
const PLOT_LEFT = 30;
const PLOT_RIGHT = 306;
const PLOT_TOP = 10;
const PLOT_BOTTOM = 120;
const AXIS_DIVISIONS = 4;
const X_LABEL_STEPS = [1, 5, 10, 15, 20, 25];
const LABEL_OFFSET_X = 6;
const LABEL_OFFSET_Y = 14;
const TODAY_LABEL_OFFSET_X = 5;
const TODAY_LABEL_OFFSET_Y = 8;
const TODAY_LINE_OPACITY = 0.35;
const PROJECTION_OPACITY = 0.5;
const AREA_TOP_OPACITY = 0.18;
const AREA_BOTTOM_OPACITY = 0;
const DASH_PATTERN = [3, 4];
const TODAY_DASH_PATTERN = [2, 3];
const CURRENT_STROKE_WIDTH = 2;
const PREVIOUS_STROKE_WIDTH = 1.5;
const DOT_RADIUS = 3;
const DOT_STROKE_WIDTH = 1.5;

interface PaceChartProps {
  current: readonly DailyExpensePoint[];
  previous: readonly DailyExpensePoint[];
  totalDays: number;
  todayDay: number | null;
  projection: number | null;
}

const useStyles = createUseSheetStyle(token => ({
  wrap: {
    width: '100%',
    minHeight: token.sizeXXL,
  },
}));

export function PaceChart({
  current,
  previous,
  totalDays,
  todayDay,
  projection,
}: PaceChartProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const { width, onLayout } = useMeasuredWidth();

  const lastCurrent = current[current.length - 1];
  const lastPrevious = previous[previous.length - 1];
  const maxValue = Math.max(
    lastCurrent?.cumulative ?? 0,
    lastPrevious?.cumulative ?? 0,
    projection ?? 0,
  );
  const axis = buildAxis(maxValue, AXIS_DIVISIONS);
  const daySpan = Math.max(totalDays - 1, 1);
  const x = (day: number) =>
    PLOT_LEFT + ((day - 1) / daySpan) * (PLOT_RIGHT - PLOT_LEFT);
  const y = (value: number) =>
    PLOT_BOTTOM - (value / axis.max) * (PLOT_BOTTOM - PLOT_TOP);
  const currentPoints = current.map(point => ({
    x: x(point.day),
    y: y(point.cumulative),
  }));
  const previousPoints = previous.map(point => ({
    x: x(point.day),
    y: y(point.cumulative),
  }));
  const xLabels = Array.from(
    new Set([...X_LABEL_STEPS.filter(day => day < totalDays), totalDays]),
  );
  const todayX =
    todayDay === null ? null : x(Math.min(Math.max(todayDay, 1), totalDays));
  const todayY =
    todayDay === null || lastCurrent === undefined
      ? null
      : y(lastCurrent.cumulative);

  const axisGroup = (
    <>
      {axis.ticks.map(tick => (
        <React.Fragment key={tick}>
          <Line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={y(tick)}
            y2={y(tick)}
            stroke={token.colorSplit}
            strokeWidth={token.lineWidth}
          />
          <SvgText
            x={PLOT_LEFT - LABEL_OFFSET_X}
            y={y(tick) + 3}
            textAnchor="end"
            fontFamily={token.fontFamily}
            fontSize={token.fontSizeXS}
            fill={token.colorTextTertiary}
          >
            {formatAxisMoney(tick)}
          </SvgText>
        </React.Fragment>
      ))}
      {xLabels.map(day => (
        <SvgText
          key={day}
          x={x(day)}
          y={PLOT_BOTTOM + LABEL_OFFSET_Y}
          textAnchor={day === totalDays ? 'end' : 'middle'}
          fontFamily={token.fontFamily}
          fontSize={token.fontSizeXS}
          fill={token.colorTextTertiary}
        >
          {day}
        </SvgText>
      ))}
    </>
  );

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={width * HEIGHT_RATIO} viewBox="0 0 311 152">
          <Defs>
            <LinearGradient id="paceArea" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0"
                stopColor={token.colorPrimary}
                stopOpacity={AREA_TOP_OPACITY}
              />
              <Stop
                offset="1"
                stopColor={token.colorPrimary}
                stopOpacity={AREA_BOTTOM_OPACITY}
              />
            </LinearGradient>
          </Defs>
          {axisGroup}
          {todayX !== null ? (
            <Line
              x1={todayX}
              x2={todayX}
              y1={PLOT_TOP}
              y2={PLOT_BOTTOM}
              stroke={token.colorPrimary}
              strokeWidth={token.lineWidth}
              strokeDasharray={TODAY_DASH_PATTERN}
              opacity={TODAY_LINE_OPACITY}
            />
          ) : null}
          {currentPoints.length > 1 ? (
            <Path
              d={buildAreaPath(currentPoints, PLOT_BOTTOM)}
              fill="url(#paceArea)"
            />
          ) : null}
          {previousPoints.length > 1 ? (
            <Path
              d={buildLinePath(previousPoints)}
              fill="none"
              stroke={token.colorTextTertiary}
              strokeWidth={PREVIOUS_STROKE_WIDTH}
              strokeDasharray={DASH_PATTERN}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {currentPoints.length > 1 ? (
            <Path
              d={buildLinePath(currentPoints)}
              fill="none"
              stroke={token.colorPrimary}
              strokeWidth={CURRENT_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {projection !== null && lastCurrent !== undefined ? (
            <Path
              d={`M${x(lastCurrent.day).toFixed(1)} ${y(
                lastCurrent.cumulative,
              ).toFixed(1)} L${x(totalDays).toFixed(1)} ${y(projection).toFixed(
                1,
              )}`}
              fill="none"
              stroke={token.colorPrimary}
              strokeWidth={PREVIOUS_STROKE_WIDTH}
              strokeDasharray={DASH_PATTERN}
              opacity={PROJECTION_OPACITY}
            />
          ) : null}
          {todayX !== null && todayY !== null ? (
            <>
              <Circle
                cx={todayX}
                cy={todayY}
                r={DOT_RADIUS}
                fill={token.colorPrimary}
                stroke={token.colorBgContainer}
                strokeWidth={DOT_STROKE_WIDTH}
              />
              <SvgText
                x={todayX - TODAY_LABEL_OFFSET_X}
                y={Math.max(todayY - TODAY_LABEL_OFFSET_Y, PLOT_TOP + LABEL_OFFSET_Y)}
                textAnchor="end"
                fontFamily={token.fontFamily}
                fontSize={token.fontSizeXS}
                fontWeight="600"
                fill={token.colorPrimary}
              >
                今天
              </SvgText>
            </>
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}
