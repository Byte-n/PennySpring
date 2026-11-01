import React from 'react';
import { Badge, Column, Row, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const SIZE_SAMPLES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 高 16 · 字 12 · 左右 5' },
  { size: 'normal', hint: 'normal · 高 20 · 字 12 · 左右 6' },
  { size: 'large', hint: 'large · 高 24 · 字 14 · 左右 8' },
];

export function BadgeSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="xs">
            {hint}
          </Text>
          <Row gap="small">
            <Badge count={3} size={size} />
            <Badge count={12} size={size} />
            <Badge count={120} overflowCount={99} size={size} />
          </Row>
        </Column>
      ))}
      <Text color="tertiary" size="xs">
        最小宽度等于高度，单个数字即正圆；等宽数字吸收 1 与 8 的宽度差
      </Text>
    </Column>
  );
}

export default BadgeSizeDemo;
