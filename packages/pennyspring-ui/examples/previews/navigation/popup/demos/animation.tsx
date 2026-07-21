import React from 'react';
import { Space, Button, Popup, Text } from '@pennyspring/ui';

type PopupAnimationDemo = 'slide' | 'fade' | 'none';

const ANIMATIONS: PopupAnimationDemo[] = ['slide', 'fade', 'none'];

export const popupAnimationDemoTitle = 'Animation';

export function PopupAnimationDemo() {
  const [animation, setAnimation] = React.useState<PopupAnimationDemo>('slide');
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space direction="vertical" size="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" size="large" wrap>
          <Button
            type={open ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent(`Opened with ${animation} animation`);
              setOpen(true);
            }}
          >
            Open
          </Button>
          {ANIMATIONS.map(item => (
            <Button
              key={item}
              type={animation === item ? 'primary' : 'default'}
              onPress={() => {
                setAnimation(item);
                setLastEvent(`Animation set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
        </Space>
      </Space>
      <Popup
        key={animation}
        animation={animation}
        onCancel={() => {
          setLastEvent(`Cancelled (${animation})`);
          setOpen(false);
        }}
        onOpenChange={setOpen}
        open={open}
      >
        <Space direction="vertical" size="normal">
          <Text color="heading" size="lg" weight="strong">
            动画演示
          </Text>
          <Text color="secondary">
            当前动画：{animation}。slide 跟随方向滑动，fade 仅淡入淡出，none 立即显示。
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

export default PopupAnimationDemo;
