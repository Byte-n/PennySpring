import React from 'react';
import { Button, Column, Popover, Space, Text } from '@pennyspring/ui';
import type { PopoverOpenChangeParams } from '@pennyspring/ui';

export function PopoverTriggerDemo() {
  const [lastEvent, setLastEvent] = React.useState('尚未触发浮层');
  const [manualOpen, setManualOpen] = React.useState(false);

  const handleCancel = ({ reason }: PopoverOpenChangeParams) => {
    setLastEvent(`浮层已关闭：${reason}`);
  };

  return (
    <Column gap="small">
      <Text color="description" size="sm">
        {lastEvent}
      </Text>
      <Space align="center" size="large" wrap>
        <Popover
          content={
            <Column gap="small">
              <Text weight="strong">点击打开的浮层</Text>
              <Text color="secondary" size="sm">
                点击浮层外部、再次点击触发器或按返回键都可以关闭。
              </Text>
            </Column>
          }
          onCancel={handleCancel}
        >
          <Button>点击打开</Button>
        </Popover>
        <Popover
          content={
            <Column gap="small">
              <Text weight="strong">自定义触发的浮层</Text>
              <Text color="secondary" size="sm">
                trigger 为 manual 时由调用方控制开关，可承载长按等自定义交互。
              </Text>
            </Column>
          }
          onCancel={handleCancel}
          onOpenChange={setManualOpen}
          open={manualOpen}
          trigger="manual"
        >
          <Button onPress={() => setManualOpen(true)}>自定义打开</Button>
        </Popover>
      </Space>
    </Column>
  );
}

export default PopoverTriggerDemo;
