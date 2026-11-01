import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import type { EChartsOption } from 'echarts';

import { EChartView } from '../../../../../../component/EChartView';
import { formatAxisMoney } from '../../analysisData';
import type { DailyExpensePoint } from '../../analysisData';
import { useMeasuredWidth } from '../useMeasuredWidth';

const VIEW_HEIGHT = 152;
const HEIGHT_RATIO = VIEW_HEIGHT / 311;
const X_LABEL_STEPS = [1, 5, 10, 15, 20, 25];

interface PaceChartProps {
  current: readonly DailyExpensePoint[];
  previous: readonly DailyExpensePoint[];
  totalDays: number;
  todayDay: number | null;
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
}: PaceChartProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const { width, onLayout } = useMeasuredWidth();
  const lastCurrent = current[current.length - 1];
  const days = Array.from({ length: totalDays }, (_, index) => index + 1);
  const currentByDay = new Map(
    current.map(point => [point.day, point.cumulative]),
  );
  const previousByDay = new Map(
    previous.map(point => [point.day, point.cumulative]),
  );
  const xLabels = new Set([
    ...X_LABEL_STEPS.filter(day => day < totalDays),
    totalDays,
  ]);
  const option: EChartsOption = {
    animation: false,
    grid: { left: 38, right: 5, top: 10, bottom: 24 },
    tooltip: {
      trigger: 'axis' as const,
      confine: true,
      valueFormatter: (value: unknown) => formatAxisMoney(Number(value ?? 0)),
    },
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: days,
      axisLine: { lineStyle: { color: token.colorBorderSecondary } },
      axisTick: { show: false },
      axisLabel: {
        color: token.colorTextTertiary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeXS,
        interval: 0,
        formatter: (value: string) => (xLabels.has(Number(value)) ? value : ''),
      },
    },
    yAxis: {
      type: 'value' as const,
      splitNumber: 4,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: token.colorTextTertiary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeXS,
        formatter: formatAxisMoney,
      },
      splitLine: {
        lineStyle: { color: token.colorSplit, width: token.lineWidth },
      },
    },
    series: [
      {
        name: '本月',
        type: 'line' as const,
        data: days.map(day => currentByDay.get(day) ?? null),
        showSymbol: false,
        lineStyle: { color: token.colorPrimary, width: 2 },
        areaStyle: { color: token.colorPrimary, opacity: 0.12 },
        markPoint:
          todayDay !== null && lastCurrent !== undefined
            ? {
                symbol: 'circle',
                symbolSize: 7,
                itemStyle: {
                  color: token.colorPrimary,
                  borderColor: token.colorBgContainer,
                  borderWidth: 1.5,
                },
                label: {
                  show: true,
                  formatter: '今天',
                  color: token.colorPrimary,
                  position: 'top',
                },
                data: [
                  {
                    name: '今天',
                    coord: [
                      Math.min(Math.max(todayDay, 1), totalDays),
                      lastCurrent.cumulative,
                    ],
                  },
                ],
              }
            : undefined,
      },
      {
        name: '上月',
        type: 'line' as const,
        data: days.map(day => previousByDay.get(day) ?? null),
        showSymbol: false,
        lineStyle: {
          color: token.colorTextTertiary,
          width: 1.5,
          type: 'dashed' as const,
        },
      },
    ],
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? (
        <EChartView
          option={option}
          width={width}
          height={width * HEIGHT_RATIO}
        />
      ) : null}
    </View>
  );
}
