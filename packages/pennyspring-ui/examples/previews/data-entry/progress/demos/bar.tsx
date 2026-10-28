import React from 'react';
import { Column, Progress, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const BAR_SAMPLES: { size: ComponentSize; percent: number; hint: string }[] = [
  { size: 'small', percent: 32, hint: 'small · 线宽 4 · 卡片内细进度' },
  { size: 'normal', percent: 62, hint: 'normal · 线宽 6 · 页面主进度' },
  { size: 'large', percent: 88, hint: 'large · 线宽 8 · 大屏汇总' },
];

export const progressBarDemoTitle = '条形（Progress.Bar）';

export function ProgressBarDemo() {
  return (
    <Column gap="normal">
      {BAR_SAMPLES.map(({ size, percent, hint }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="xs">{hint}</Text>
          <Text color="secondary" size="xs">预算</Text>
          <Progress.Bar percent={percent} size={size} />
        </Column>
      ))}
      <Column gap="small">
        <Text color="tertiary" size="xs">0% 不渲染圆头；100% 铺满轨道</Text>
        <Progress.Bar percent={0} />
        <Progress.Bar percent={100} />
      </Column>
      <Text color="tertiary" size="xs">
        轨道 colorFillSecondary，999 圆角；百分比 12 / 12 / 14 等宽右对齐
      </Text>
    </Column>
  );
}

export default ProgressBarDemo;
