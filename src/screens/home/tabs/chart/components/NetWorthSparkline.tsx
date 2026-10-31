import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';

import type { NetWorthPoint } from '../analysisData';
import { useMeasuredWidth } from './useMeasuredWidth';
import { EChartView } from '../../../../../component/EChartView';

const VIEW_WIDTH = 311;
const VIEW_HEIGHT = 64;
const HEIGHT_RATIO = VIEW_HEIGHT / VIEW_WIDTH;
const RANGE_PADDING = 0.1;

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
  const option = {
    animation: false,
    grid: { left: 4, right: 4, top: 8, bottom: 18 },
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: points.map(point => point.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: token.colorTextTertiary,
        fontFamily: token.fontFamily,
        fontSize: token.fontSizeXS,
        interval: points.length - 1,
      },
    },
    yAxis: {
      type: 'value' as const,
      min: paddedMin,
      max: paddedMax,
      show: false,
    },
    tooltip: {
      trigger: 'axis' as const,
      confine: true,
      formatter: (params: unknown) => {
        if (!Array.isArray(params) || params.length === 0) {
          return '';
        }
        const item = params[0] as { axisValue?: string; value?: number };
        return `${item.axisValue ?? ''}<br/>净资产 ${item.value ?? 0}`;
      },
    },
    series: [
      {
        type: 'line' as const,
        data: points.map(point => point.value),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: lineColor, width: 2 },
        areaStyle: { color: lineColor, opacity: 0.18 },
        emphasis: {
          itemStyle: { color: lineColor, borderColor: token.colorBgContainer, borderWidth: 1.5 },
        },
      },
    ],
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {width > 0 ? (
        <EChartView option={option} width={width} height={width * HEIGHT_RATIO} />
      ) : null}
    </View>
  );
}
