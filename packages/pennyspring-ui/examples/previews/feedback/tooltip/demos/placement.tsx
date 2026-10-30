import React from 'react';
import { Button, Column, Space, Text, Tooltip } from '@pennyspring/ui';

export function TooltipPlacementDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        默认 top；本侧装不下且对侧更宽裕时自动翻面，水平方向收敛在屏幕 12 边距内。
      </Text>
      <Space align="center" size="normal" wrap>
        <Tooltip content="从上方向下指。" placement="top">
          <Button>top</Button>
        </Tooltip>
        <Tooltip content="从下方向上指。" placement="bottom">
          <Button>bottom</Button>
        </Tooltip>
        <Tooltip content="从左侧向右指。" placement="left">
          <Button>left</Button>
        </Tooltip>
        <Tooltip content="从右侧向左指。" placement="right">
          <Button>right</Button>
        </Tooltip>
      </Space>
    </Column>
  );
}

export default TooltipPlacementDemo;
