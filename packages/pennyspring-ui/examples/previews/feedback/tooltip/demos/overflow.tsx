import React from 'react';
import { Button, Column, Space, Text, Tooltip } from '@pennyspring/ui';

export const tooltipOverflowDemoTitle = '尺寸与溢出';

export function TooltipOverflowDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        宽度封顶 240；高度取当前方位的可用空间并按整行封顶，超出在气泡内滚动。内容仍读不完时，应该改用 Popover 或页面。
      </Text>
      <Space align="center" size="large" wrap>
        <Tooltip content="短内容只占一行，不会出现滚动条。">
          <Button>短内容</Button>
        </Tooltip>
        <Tooltip
          content="按账单日统计，不含预授权冻结与跨月分期；退款计入发生月，不在原月冲减，因此与银行 App 的可用额度可能相差一笔。分期手续费按每期摊销计入当月支出，提前结清时剩余手续费一次性计入结清月。"
          trigger="press"
        >
          <Button>超长内容 · 滚动</Button>
        </Tooltip>
        <Tooltip arrow={false} content="arrow={false} 时只保留气泡，间距不变。">
          <Button>关闭箭头</Button>
        </Tooltip>
      </Space>
    </Column>
  );
}

export default TooltipOverflowDemo;
