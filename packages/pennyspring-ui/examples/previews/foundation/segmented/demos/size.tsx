import React from 'react';
import { Column, Segmented, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

export const segmentedSizeDemoTitle = '尺寸（size）';

const SIZE_SAMPLES: {
  size: ComponentSize;
  hint: string;
  options: { label: string; value: string }[];
  value: string;
}[] = [
  {
    size: 'small',
    hint: 'small · 轨道高 37.4 / 文字 12 / 内边距 2',
    options: [
      { label: '日', value: 'day' },
      { label: '周', value: 'week' },
      { label: '月', value: 'month' },
    ],
    value: 'week',
  },
  {
    size: 'normal',
    hint: 'normal · 轨道高 44 / 文字 14 / 内边距 3',
    options: [
      { label: '支出', value: 'expense' },
      { label: '收入', value: 'income' },
      { label: '转账', value: 'transfer' },
    ],
    value: 'income',
  },
  {
    size: 'large',
    hint: 'large · 轨道高 50.6 / 文字 16 / 内边距 4',
    options: [
      { label: '概览', value: 'overview' },
      { label: '明细', value: 'detail' },
      { label: '图表', value: 'chart' },
    ],
    value: 'detail',
  },
];

export function SegmentedSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(sample => (
        <Column key={sample.size} gap="small">
          <Text color="tertiary" size="sm">{sample.hint}</Text>
          <Segmented
            defaultValue={sample.value}
            options={sample.options}
            size={sample.size}
          />
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        轨道高度取 controlHeightSM / controlHeight / controlHeightLG；选中块为白底 + boxShadowTertiary，不使用主色
      </Text>
    </Column>
  );
}

export default SegmentedSizeDemo;
