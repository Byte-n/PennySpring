import React, { useEffect, useRef } from 'react';
import { SkiaChart, SkiaRenderer } from '@wuba/react-native-echarts';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { GeometryReader } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { ChartOption } from './chartOptions';

echarts.use([
  SkiaRenderer,
  PieChart,
  BarChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
]);

interface EChartProps {
  option: ChartOption;
  height: number;
  onItemClick?: (dataIndex: number) => void;
}

const useStyles = createUseSheetStyle<{ height: number }>((_, { height }) => ({
  root: {
    height,
  },
}));

export function EChart({ option, height, onItemClick }: EChartProps) {
  const styles = useStyles({ height });
  const chartRef = useRef<any>(null);

  return (
    <GeometryReader style={styles.root}>
      {({ width }) => (
        <EChartCanvas
          option={option}
          width={width}
          height={height}
          onItemClick={onItemClick}
          chartRef={chartRef}
        />
      )}
    </GeometryReader>
  );
}

interface EChartCanvasProps extends EChartProps {
  width: number;
  chartRef: React.MutableRefObject<any>;
}

function EChartCanvas({
  option,
  width,
  height,
  onItemClick,
  chartRef,
}: EChartCanvasProps) {
  useEffect(() => {
    const node = chartRef.current;
    if (!node || width === 0) return undefined;
    const chart = echarts.init(node, undefined, {
      renderer: 'skia' as 'canvas',
      width,
      height,
    });
    chart.setOption(option, true);
    if (onItemClick) {
      chart.on('click', (params: { dataIndex: number }) =>
        onItemClick(params.dataIndex),
      );
    }
    return () => chart.dispose();
  }, [option, width, height, onItemClick, chartRef]);

  return <SkiaChart ref={chartRef} />;
}
