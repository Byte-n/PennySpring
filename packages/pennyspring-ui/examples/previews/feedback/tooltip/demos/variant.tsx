import React from 'react';
import { Button, Column, Space, Text, Tooltip } from '@pennyspring/ui';

export function TooltipVariantDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        dark 压在图表与金额上不抢数；light
        贴在设置列表里更轻。点击触发器查看，再点一次或点空白关闭。
      </Text>
      <Space align="center" gap="large" wrap>
        <Tooltip content="按每月最后一天的账户余额合计，已剔除账户间转账。">
          <Button type="primary">dark · 口径说明</Button>
        </Tooltip>
        <Tooltip
          content="退款计入抵扣，不在原月冲减。"
          placement="bottom"
          variant="light"
        >
          <Button>light · 口径说明</Button>
        </Tooltip>
      </Space>
    </Column>
  );
}

export default TooltipVariantDemo;
