import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { buildAxis } from '../../chartGeometry';
import { formatAxisMoney } from '../../analysisData';
import type { MonthlyCashflow } from '../../analysisData';
import { useMeasuredWidth } from '../useMeasuredWidth';

const VIEW_WIDTH = 311;
const VIEW_HEIGHT = 152;
const HEIGHT_RATIO = VIEW_HEIGHT / VIEW_WIDTH;
const PLOT_LEFT = 30;
const PLOT_RIGHT = 306;
const PLOT_TOP = 10;
const PLOT_BOTTOM = 118;
const AXIS_DIVISIONS = 4;
const BAR_WIDTH = 10;
const BAR_GAP = 3;
const BAR_RADIUS = 2;
const LABEL_OFFSET_Y = 14;

interface IncomeTrendChartProps {
  months: readonly MonthlyCashflow[];
}

const useStyles = createUseSheetStyle(token => ({
  wrap: {
    width: '100%',
    minHeight: token.sizeXXL,
  },
}));

export function IncomeTrendChart({ months }: IncomeTrendChartProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const { width, onLayout } = useMeasuredWidth();
  const maxValue = months.reduce(
    (max, month) => Math.max(max, month.income, month.expense),
    0,
  );
  const axis = buildAxis(maxValue, AXIS_DIVISIONS);
  const groupWidth =
    months.length === 0 ? 0 : (PLOT_RIGHT - PLOT_LEFT) / months.length;
  const y = (value: number) =>
    PLOT_BOTTOM - (value / axis.max) * (PLOT_BOTTOM - PLOT_TOP);

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? (
        <Svg width={width} height={width * HEIGHT_RATIO} viewBox="0 0 311 152">
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
                x={PLOT_LEFT - 6}
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
          {months.map((month, index) => {
            const center = PLOT_LEFT + groupWidth * (index + 0.5);
            const isCurrent = month.label.endsWith('*');
            const incomeHeight = PLOT_BOTTOM - y(month.income);
            const expenseHeight = PLOT_BOTTOM - y(month.expense);
            return (
              <React.Fragment key={month.start}>
                <Rect
                  x={center - BAR_GAP / 2 - BAR_WIDTH}
                  y={y(month.income)}
                  width={BAR_WIDTH}
                  height={incomeHeight}
                  rx={BAR_RADIUS}
                  fill={token.colorSuccess}
                />
                <Rect
                  x={center + BAR_GAP / 2}
                  y={y(month.expense)}
                  width={BAR_WIDTH}
                  height={expenseHeight}
                  rx={BAR_RADIUS}
                  fill={token.colorError}
                />
                <SvgText
                  x={center}
                  y={PLOT_BOTTOM + LABEL_OFFSET_Y}
                  textAnchor="middle"
                  fontFamily={token.fontFamily}
                  fontSize={token.fontSizeXS}
                  fontWeight={isCurrent ? '600' : '400'}
                  fill={isCurrent ? token.colorText : token.colorTextTertiary}
                >
                  {month.label}
                </SvgText>
              </React.Fragment>
            );
          })}
          <Line
            x1={PLOT_LEFT}
            x2={PLOT_RIGHT}
            y1={PLOT_BOTTOM}
            y2={PLOT_BOTTOM}
            stroke={token.colorBorderSecondary}
            strokeWidth={token.lineWidth}
          />
        </Svg>
      ) : null}
    </View>
  );
}
