import React from 'react';
import { Badge, Column, Row, Text } from '@pennyspring/ui';
import type { BadgeColor } from '@pennyspring/ui';

const BADGE_COLORS: { color: BadgeColor; hint: string }[] = [
  { color: 'default', hint: 'default · 中性计数' },
  { color: 'primary', hint: 'primary · 进行中' },
  { color: 'success', hint: 'success · 收入到账' },
  { color: 'warning', hint: 'warning · 待确认' },
  { color: 'danger', hint: 'danger · 未读 / 待处理' },
  { color: 'info', hint: 'info · 提示' },
];

export function BadgeColorDemo() {
  return (
    <Column gap="normal">
      <Row gap="large" wrap>
        {BADGE_COLORS.map(({ color }) => (
          <Badge key={color} color={color} count={color === 'info' ? 'i' : 8} />
        ))}
      </Row>
      <Column gap="small">
        {BADGE_COLORS.map(({ color, hint }) => (
          <Text key={color} color="tertiary" size="xs">
            {hint}
          </Text>
        ))}
      </Column>
      <Text color="tertiary" size="xs">
        default 保持 colorText；颜色不单独承载含义，未读必须配文案
      </Text>
    </Column>
  );
}

export default BadgeColorDemo;
