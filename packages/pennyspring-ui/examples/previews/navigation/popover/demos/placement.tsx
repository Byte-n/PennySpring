import React from 'react';
import { Button, Popover, Space, Text } from '@pennyspring/ui';
import type { PopoverPlacement } from '@pennyspring/ui';

const PLACEMENTS: readonly PopoverPlacement[] = [
  'top',
  'bottom',
  'left',
  'right',
];

export const popoverPlacementDemoTitle = '弹出方向';

export function PopoverPlacementDemo() {
  return (
    <Space align="center" size="large" wrap>
      {PLACEMENTS.map(placement => (
        <Popover
          key={placement}
          content={
            <Text size="sm">
              当前方向：{placement}，空间不足时会自动翻转到对侧。
            </Text>
          }
          placement={placement}
        >
          <Button size="small">{placement}</Button>
        </Popover>
      ))}
    </Space>
  );
}

export default PopoverPlacementDemo;
