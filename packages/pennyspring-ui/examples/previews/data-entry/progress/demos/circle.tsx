import React from 'react';
import { Column, Progress, Row, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const CIRCLE_SIZES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 40 · 环宽 3' },
  { size: 'normal', hint: 'normal · 48 · 环宽 4' },
  { size: 'large', hint: 'large · 56 · 环宽 4' },
];

export function ProgressCircleDemo() {
  return (
    <Column gap="normal">
      <Row gap="large" wrap>
        {CIRCLE_SIZES.map(({ size }) => (
          <Progress.Circle key={size} percent={60} size={size} />
        ))}
      </Row>
      <Column gap="small">
        {CIRCLE_SIZES.map(({ size, hint }) => (
          <Text key={size} color="tertiary" size="xs">
            {hint}
          </Text>
        ))}
      </Column>
      <Text color="tertiary" size="xs">
        状态：success 与 exception 只改环与中心数字
      </Text>
      <Row gap="large" wrap>
        <Progress.Circle percent={60} />
        <Progress.Circle percent={100} status="success" />
        <Progress.Circle percent={84} status="error" />
      </Row>
      <Text color="tertiary" size="xs">
        中心数字 12 / 14 / 16，600 等宽；环内不显示百分号时用 format 返回节点
      </Text>
      <Progress.Circle
        percent={42}
        status="error"
        format={percent => `${Math.round(percent / 10)}/10`}
      />
    </Column>
  );
}

export default ProgressCircleDemo;
