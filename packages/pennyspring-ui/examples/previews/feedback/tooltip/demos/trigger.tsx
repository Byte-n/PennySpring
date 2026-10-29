import React from 'react';
import { Button, Column, Space, Text, Tooltip } from '@pennyspring/ui';
import type { TooltipOpenChangeParams } from '@pennyspring/ui';

export const tooltipTriggerDemoTitle = '触发方式（trigger）';

export function TooltipTriggerDemo() {
  const [lastEvent, setLastEvent] = React.useState('尚未触发提示');
  const [manualOpen, setManualOpen] = React.useState(false);

  const handleCancel = ({ reason }: TooltipOpenChangeParams) => {
    setLastEvent(`提示已关闭：${reason}`);
  };

  return (
    <Column gap="small">
      <Text color="description" size="sm">
        {lastEvent}
      </Text>
      <Space align="center" size="large" wrap>
        <Tooltip
          content="press 是默认触发：点一下打开，再点一下关闭。"
          onCancel={handleCancel}
        >
          <Button>press</Button>
        </Tooltip>
        <Tooltip
          content="长按打开后松手保留，方便继续阅读。"
          onCancel={handleCancel}
          trigger="longPress"
        >
          <Button>长按打开</Button>
        </Tooltip>
        <Tooltip
          content="trigger 为 manual 时由调用方控制开关。"
          onCancel={handleCancel}
          onOpenChange={setManualOpen}
          open={manualOpen}
          trigger="manual"
        >
          <Button onPress={() => setManualOpen(true)}>manual 打开</Button>
        </Tooltip>
      </Space>
    </Column>
  );
}

export default TooltipTriggerDemo;
