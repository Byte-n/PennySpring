import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const popupMaskAndCloseBehaviorDemoTitle = 'Mask and close behavior';

export function PopupMaskAndCloseBehaviorDemo() {
  const [centerOpen, setCenterOpen] = React.useState(false);
  const [lockedOpen, setLockedOpen] = React.useState(false);
  const [_lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        <Button
          type={centerOpen ? 'primary' : 'default'}
          onPress={() => {
            setLastEvent('Opened center popup without mask');
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
    </>
  );
}

export default PopupMaskAndCloseBehaviorDemo;
