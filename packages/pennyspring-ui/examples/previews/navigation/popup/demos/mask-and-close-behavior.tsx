import React from 'react';
import { Space, Button, Popup, Text } from '@pennyspring/ui';

export function PopupMaskAndCloseBehaviorDemo() {
  const [centerOpen, setCenterOpen] = React.useState(false);
  const [lockedOpen, setLockedOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space direction="vertical" gap="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" gap="large" wrap>
          <Button
            type={centerOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened popup without mask');
              setCenterOpen(true);
            }}
          >
            No mask
          </Button>
          <Button
            type={lockedOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened locked popup');
              setLockedOpen(true);
            }}
          >
            Mask locked
          </Button>
        </Space>
      </Space>
      <Popup
        mask={false}
        onCancel={() => {
          setLastEvent('No-mask popup cancelled');
          setCenterOpen(false);
        }}
        onOpenChange={setCenterOpen}
        open={centerOpen}
      >
        <Space direction="vertical" gap="normal">
          <Text color="heading" size="lg" weight="strong">
            无遮罩
          </Text>
          <Text color="secondary">
            mask 为 false 时不渲染遮罩层，点击空白处不会关闭，需通过按钮或硬件返回键关闭。
          </Text>
          <Space justify="end" gap="small">
            <Button type="primary" onPress={() => setCenterOpen(false)}>
              关闭
            </Button>
          </Space>
        </Space>
      </Popup>
      <Popup
        closeOnMaskClick={false}
        onCancel={() => {
          setLastEvent('Locked popup cancelled');
          setLockedOpen(false);
        }}
        onOpenChange={setLockedOpen}
        open={lockedOpen}
      >
        <Space direction="vertical" gap="normal">
          <Text color="heading" size="lg" weight="strong">
            遮罩锁定
          </Text>
          <Text color="secondary">
            closeOnMaskClick 为 false 时遮罩可见但点击不关闭，强制用户通过按钮或确认流程关闭。
          </Text>
          <Space justify="end" gap="small">
            <Button type="primary" onPress={() => setLockedOpen(false)}>
              关闭
            </Button>
          </Space>
        </Space>
      </Popup>
    </>
  );
}

export default PopupMaskAndCloseBehaviorDemo;
