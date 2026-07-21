import React from 'react';
import { Space, Button, Popup, Text } from '@pennyspring/ui';
import type { PopupPosition } from '@pennyspring/ui';

const POSITIONS: PopupPosition[] = ['bottom', 'top', 'left', 'right', 'center'];

export const popupPositionDemoTitle = 'Position';

export function PopupPositionDemo() {
  const [position, setPosition] = React.useState<PopupPosition>('bottom');
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space direction="vertical" size="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" size="large" wrap>
          {POSITIONS.map(item => (
            <Button
              key={item}
              type={position === item && open ? 'primary' : 'default'}
              onPress={() => {
                setPosition(item);
                setLastEvent(`Opened ${item} popup`);
                setOpen(true);
              }}
            >
              Open {item}
            </Button>
          ))}
        </Space>
      </Space>
      <Popup
        animation="slide"
        onCancel={() => {
          setLastEvent(`${position} popup cancelled`);
          setOpen(false);
        }}
        onOpenChange={setOpen}
        open={open}
        position={position}
      >
        <Space direction="vertical" size="normal">
          <Text color="heading" size="lg" weight="strong">
            位置：{position}
          </Text>
          <Text color="secondary">
            bottom/top 从屏幕边缘滑入并铺满宽度，left/right 占 70% 宽度贴边弹出，center 居中显示并淡入淡出。
          </Text>
          <Space justify="end" size="small">
            <Button type="primary" onPress={() => setOpen(false)}>
              关闭
            </Button>
          </Space>
        </Space>
      </Popup>
    </>
  );
}

export default PopupPositionDemo;
