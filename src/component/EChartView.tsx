import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/ui';
import SkiaChart, { SkiaRenderer } from '@wuba/react-native-echarts/skiaChart';
import type { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import type { ECharts } from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { AxisPointerComponent, GridComponent, TooltipComponent } from 'echarts/components';

echarts.use([
  SkiaRenderer,
  BarChart,
  LineChart,
  PieChart,
  AxisPointerComponent,
  GridComponent,
  TooltipComponent,
]);

interface EChartViewProps {
  option: EChartsOption;
  width: number;
  height: number;
}

const useStyles = createUseSheetStyle(() => ({
  chart: {
    width: '100%',
  },
}));

export function EChartView({ option, width, height }: EChartViewProps) {
  const styles = useStyles();
  const chartRef = useRef<React.ElementRef<typeof SkiaChart>>(null);
  const chartInstance = useRef<ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || width <= 0 || height <= 0) {
      return;
    }

    const chart = echarts.init(chartRef.current as never, undefined, {
      renderer: 'svg',
      width,
      height,
    });
    chartInstance.current = chart;
    chart.setOption(option, true);

    return () => {
      chart.dispose();
      chartInstance.current = null;
    };
  }, [height, width]);

  useEffect(() => {
    chartInstance.current?.setOption(option, true);
  }, [option]);

  return (
    <View style={styles.chart}>
      <SkiaChart
        ref={chartRef}
        width={width}
        height={height}
        useRNGH
      />
    </View>
  );
}
