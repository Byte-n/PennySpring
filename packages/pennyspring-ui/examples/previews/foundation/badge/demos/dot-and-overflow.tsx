import React from 'react';
import { Badge, Column, Row, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const DOT_SIZES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 6' },
  { size: 'normal', hint: 'normal · 8' },
  { size: 'large', hint: 'large · 10' },
];

export const badgeDotAndOverflowDemoTitle = '圆点与溢出';

export function BadgeDotAndOverflowDemo() {
  return (
    <Column gap="normal">
      <Column gap="small">
        <Text color="tertiary" size="xs">圆点只表达「有新内容」，不叠加数字</Text>
        <Row gap="large">
          {DOT_SIZES.map(({ size }) => (
            <Badge key={size} color="danger" dot size={size} />
          ))}
        </Row>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">overflowCount 默认 99，超过时固定读作 99+</Text>
        <Row gap="small">
          <Badge count={98} />
          <Badge count={100} />
        </Row>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">0 默认整颗不渲染；showZero 才显示</Text>
        <Row gap="small">
          <Text color="tertiary" size="xs">showZero=false：不渲染</Text>
          <Badge count={0} showZero />
        </Row>
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">count 传节点时保持自定义内容，字号走 Text 语义</Text>
        <Badge
          color="primary"
          count={<Text color="lightSolid" size="xs" weight="semibold">VIP</Text>}
          size="large"
        />
      </Column>
    </Column>
  );
}

export default BadgeDotAndOverflowDemo;
