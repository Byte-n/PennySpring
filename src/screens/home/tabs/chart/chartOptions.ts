import type { AliasToken } from '@pennyspring/theme';
import { formatAmount } from '../detail/detailData';
import type { ExpenseCategoryStat } from './chartData';

export type ChartOption = Record<string, unknown>;

const PERCENT_BASE = 100;

function categoryPalette(token: AliasToken): string[] {
  return [
    token.blue6,
    token.cyan6,
    token.green6,
    token.gold6,
    token.magenta6,
    token.purple6,
    token.orange6,
    token.geekblue6,
    token.lime6,
    token.volcano6,
  ];
}

function colorOf(
  stat: ExpenseCategoryStat,
  index: number,
  palette: string[],
  neutral: string,
): string {
  if (stat.virtual || stat.typeId === null) return neutral;
  return palette[index % palette.length];
}

function formatPercent(percent: number): string {
  return `${Math.round(percent * PERCENT_BASE)}%`;
}

function tooltip(token: AliasToken): ChartOption {
  return {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    textStyle: { color: token.colorText },
  };
}

export function buildPieOption(
  stats: readonly ExpenseCategoryStat[],
  token: AliasToken,
): ChartOption {
  const palette = categoryPalette(token);
  return {
    backgroundColor: 'transparent',
    textStyle: { color: token.colorText },
    tooltip: {
      ...tooltip(token),
      trigger: 'item',
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}  ¥${formatAmount(params.value)}  ${params.percent}%`,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: true,
        label: {
          color: token.colorTextSecondary,
          formatter: (params: { name: string }) => params.name,
        },
        labelLine: { lineStyle: { color: token.colorBorderSecondary } },
        data: stats.map((stat, index) => ({
          name: stat.name,
          value: stat.amount,
          itemStyle: {
            color: colorOf(stat, index, palette, token.colorTextTertiary),
          },
        })),
      },
    ],
  };
}

export function buildBarOption(
  stats: readonly ExpenseCategoryStat[],
  token: AliasToken,
): ChartOption {
  const palette = categoryPalette(token);
  const ordered = [...stats].reverse();
  return {
    backgroundColor: 'transparent',
    textStyle: { color: token.colorText },
    grid: { left: '3%', right: '8%', top: '4%', bottom: '3%', containLabel: true },
    tooltip: {
      ...tooltip(token),
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}  ¥${formatAmount(params[0].value)}`,
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: token.colorTextTertiary,
        formatter: (value: number) => formatAmount(value),
      },
      axisLine: { lineStyle: { color: token.colorBorderSecondary } },
      splitLine: { lineStyle: { color: token.colorSplit } },
    },
    yAxis: {
      type: 'category',
      data: ordered.map(stat => stat.name),
      axisLabel: { color: token.colorTextSecondary },
      axisLine: { lineStyle: { color: token.colorBorderSecondary } },
    },
    series: [
      {
        type: 'bar',
        data: ordered.map((stat, index) => ({
          value: stat.amount,
          itemStyle: {
            color: colorOf(
              stat,
              ordered.length - 1 - index,
              palette,
              token.colorTextTertiary,
            ),
          },
        })),
      },
    ],
  };
}

export { formatPercent };
