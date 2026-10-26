import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { EChartsOption } from 'echarts';

import { formatAxisMoney, formatMoney } from '../../analysisData';
import { EChartView } from '../../../../../../component/EChartView';
import { useMeasuredWidth } from '../useMeasuredWidth';

const CHART_HEIGHT = 168;

export interface DonutSlice {
  key: string;
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: readonly DonutSlice[];
}

const useStyles = createUseSheetStyle(token => ({
  wrap: {
    width: '100%',
    minHeight: token.sizeXXL,
  },
}));

export function DonutChart({ slices }: DonutChartProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const { width, onLayout } = useMeasuredWidth();
  const option: EChartsOption = {
    animation: false,
    grid: { left: 8, right: 56, top: 8, bottom: 28, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      confine: true,
      valueFormatter: value => formatMoney(Number(value ?? 0)),
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: token.colorBorderSecondary } },
      axisTick: { show: true, lineStyle: { color: token.colorBorderSecondary } },
      axisLabel: {
        show: true,
        color: token.colorTextTertiary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeXS,
        formatter: formatAxisMoney,
      },
      splitLine: { show: true, lineStyle: { color: token.colorSplit, width: token.lineWidth } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: slices.map(slice => slice.name),
      axisLine: { show: true, lineStyle: { color: token.colorBorderSecondary } },
      axisTick: { show: true, lineStyle: { color: token.colorBorderSecondary } },
      axisLabel: {
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeSM,
        width: 88,
        overflow: 'truncate',
      },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 16,
        data: slices.map(slice => ({
          value: slice.value,
          itemStyle: { color: slice.color, borderRadius: [0, 4, 4, 0] },
        })),
        label: {
          show: true,
          position: 'right',
          color: token.colorTextSecondary,
          fontFamily: token.fontFamily,
          fontSize: token.fontSizeXS,
          formatter: params => formatMoney(Number(params.value ?? 0)),
        },
      },
    ],
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? <EChartView option={option} width={width} height={CHART_HEIGHT} /> : null}
    </View>
  );
}
