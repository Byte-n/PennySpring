import React from 'react';
import { Space, Button, Popup, Text } from '@pennyspring/ui';
import type { PopupAnimation } from '@pennyspring/ui';

const ANIMATIONS: PopupAnimation[] = ['fade', 'opacity'];

export function PopupAnimationDemo() {
  const [animation, setAnimation] = React.useState<PopupAnimation>('fade');
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space direction="vertical" size="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" size="large" wrap>
          {ANIMATIONS.map(item => (
            <Button
              key={item}
              type={animation === item ? 'primary' : 'default'}
              onPress={() => {
                setAnimation(item);
                setLastEvent(`Switched to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
          <Button
            type="primary"
            onPress={() => {
              setLastEvent(`Opened ${animation} popup`);
              setOpen(true);
            }}
          >
            打开
          </Button>
        </Space>
      </Space>
      <Popup
        key={animation}
        animation={animation}
        onCancel={() => {
          setLastEvent(`${animation} popup cancelled`);
          setOpen(false);
        }}
        onOpenChange={setOpen}
        open={open}
      >
        <Space direction="vertical" size="normal">
          <Text color="heading" size="lg" weight="strong">
            动画：{animation}
          </Text>
          <Text color="secondary">
            fade 从底部滑出与退出，opacity 仅透明度淡入淡出；显示为「挂载 →
            动画」，隐藏为「动画 → 卸载」。
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
