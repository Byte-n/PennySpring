import React from 'react';
import { Column, Tabs, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const SIZE_SAMPLES: { size: ComponentSize; hint: string; labels: string[] }[] =
  [
    {
      size: 'small',
      hint: 'small · 行高 32 / 内边距 8 / 文字 14',
      labels: ['本日', '本周', '本月'],
    },
    {
      size: 'normal',
      hint: 'normal · 行高 40 / 内边距 12 / 文字 14',
      labels: ['概览', '明细', '图表'],
    },
    {
      size: 'large',
      hint: 'large · 行高 48 / 内边距 12 / 文字 16',
      labels: ['账本', '资产'],
    },
  ];

export function TabsSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint, labels }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="sm">
            {hint}
          </Text>
          <Tabs
            defaultValue={labels[0]}
            items={labels.map(label => ({ label, value: label }))}
            size={size}
          />
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        下划线左右内缩等于项内边距，线长始终等于文字宽；行高不足 44 时用 hitSlop
        垂直补足
      </Text>
    </Column>
  );
}

export default TabsSizeDemo;
