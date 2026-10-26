import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { EChartsOption } from 'echarts';
import { EChartView } from '../../../../../../component/EChartView';

import { formatAxisMoney } from '../../analysisData';
import type { MonthlyCashflow } from '../../analysisData';
import { useMeasuredWidth } from '../useMeasuredWidth';

const VIEW_HEIGHT = 152;

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
  const option: EChartsOption = {
    animation: false,
    grid: { left: 38, right: 5, top: 8, bottom: 24 },
    tooltip: { trigger: 'axis' as const, confine: true },
    xAxis: {
      type: 'category' as const,
      data: months.map(month => month.label),
      axisLine: { lineStyle: { color: token.colorBorderSecondary } },
      axisTick: { show: false },
      axisLabel: {
        color: token.colorTextTertiary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeXS,
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
      splitLine: { lineStyle: { color: token.colorSplit, width: token.lineWidth } },
    },
    series: [
      {
        name: '收入',
        type: 'bar' as const,
        data: months.map(month => month.income),
        barMaxWidth: 10,
        itemStyle: { color: token.colorSuccess, borderRadius: [2, 2, 0, 0] },
      },
      {
        name: '支出',
        type: 'bar' as const,
        data: months.map(month => month.expense),
        barMaxWidth: 10,
        itemStyle: { color: token.colorError, borderRadius: [2, 2, 0, 0] },
      },
    ],
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? (
        <EChartView option={option} width={width} height={VIEW_HEIGHT} />
      ) : null}
    </View>
  );
}
