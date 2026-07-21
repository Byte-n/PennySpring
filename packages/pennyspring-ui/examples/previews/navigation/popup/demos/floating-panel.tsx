import React from 'react';
import { Space, Button, Popup, Text } from '@pennyspring/ui';

export const popupFloatingPanelDemoTitle = 'FloatingPanel';

export function PopupFloatingPanelDemo() {
  const [floatingOpen, setFloatingOpen] = React.useState(false);
  const [customOpen, setCustomOpen] = React.useState(false);
  const [floatingSize, setFloatingSize] = React.useState<
    'small' | 'normal' | 'large'
  >('normal');
  const [floatingPosition, setFloatingPosition] = React.useState<
    'top' | 'bottom'
  >('bottom');
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space direction="vertical" size="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" size="large" wrap>
          <Button
            type={floatingOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened floating panel');
              setFloatingOpen(true);
            }}
          >
            Open panel
          </Button>
          {(['small', 'normal', 'large'] as const).map(item => (
            <Button
              key={item}
              type={floatingSize === item ? 'primary' : 'default'}
              onPress={() => {
                setFloatingSize(item);
                setLastEvent(`Floating panel size set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
          {(['bottom', 'top'] as const).map(item => (
            <Button
              key={item}
              type={floatingPosition === item ? 'primary' : 'default'}
              onPress={() => {
                setFloatingPosition(item);
                setLastEvent(`Floating panel position set to ${item}`);
              }}
            >
              {item}
            </Button>
          ))}
          <Button
            type={customOpen ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened custom floating panel');
              setCustomOpen(true);
            }}
          >
            Custom header/footer
          </Button>
        </Space>
      </Space>
      <Popup.FloatingPanel
        closeOnMaskClick
        okText="完成"
        onCancel={() => {
          setLastEvent('Floating panel cancelled');
          setFloatingOpen(false);
        }}
        onOk={() => {
          setLastEvent('Floating panel confirmed');
          setFloatingOpen(false);
        }}
        onOpenChange={setFloatingOpen}
        open={floatingOpen}
        position={floatingPosition}
        size={floatingSize}
        titleText="基础浮动面板"
      >
        <Space direction="vertical" size="normal">
          <Text color="secondary">
            这是带 titleText、okText、onOk 和 onCancel 的三段式面板。
          </Text>
          <Text color="description">
            拖动把手可以调整高度，点击遮罩会按取消流程关闭。
          </Text>
        </Space>
      </Popup.FloatingPanel>
      <Popup.FloatingPanel
        onCancel={() => {
          setLastEvent('Custom floating panel cancelled');
          setCustomOpen(false);
        }}
        onOk={() => {
          setLastEvent('Custom floating panel confirmed');
          setCustomOpen(false);
        }}
        onOpenChange={setCustomOpen}
        open={customOpen}
        renderFooter={({ cancel, confirm }) => (
          <Space justify="end" size="normal">
            <Button onPress={cancel} type="text">
              稍后
            </Button>
            <Button onPress={confirm} type="primary">
              保存
            </Button>
          </Space>
        )}
        renderHeader={({ cancel }) => (
          <Space align="center" justify="between">
            <Text color="heading" size="lg" weight="strong">
              自定义头部
            </Text>
            <Button onPress={cancel} type="text">
              关闭
            </Button>
          </Space>
        )}
      >
        <Text color="secondary">
          renderHeader 与 renderFooter 可以拿到统一的 cancel / confirm 行为。
        </Text>
      </Popup.FloatingPanel>
    </>
  );
}

export default PopupFloatingPanelDemo;
