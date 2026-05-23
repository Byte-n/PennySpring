import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const popupFloatingPanelDemoTitle = 'FloatingPanel';

export function PopupFloatingPanelDemo() {
  const [floatingOpen, setFloatingOpen] = React.useState(false);
  const [floatingSize, setFloatingSize] = React.useState<
    'small' | 'normal' | 'large'
  >('normal');
  const [floatingPosition, setFloatingPosition] = React.useState<
    'top' | 'bottom'
  >('bottom');
  const [_lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
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
      </Space>
    </>
  );
}

export default PopupFloatingPanelDemo;
