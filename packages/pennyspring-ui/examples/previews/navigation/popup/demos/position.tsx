import React from 'react';
import { Space, Button } from '@pennyspring/ui';
import type { PopupPosition } from '@pennyspring/ui';

const POSITIONS: PopupPosition[] = ['bottom', 'top', 'left', 'right', 'center'];

export const popupPositionDemoTitle = 'Position';

export function PopupPositionDemo() {
  const [position, setPosition] = React.useState<PopupPosition>('bottom');
  const [_positionOpen, setPositionOpen] = React.useState(false);
  const [_lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        {POSITIONS.map(item => (
          <Button
            key={item}
            type={position === item ? 'primary' : 'default'}
            onPress={() => {
              setPosition(item);
              setLastEvent(`Opened ${item} popup`);
              setPositionOpen(true);
            }}
          >
            Open {item}
          </Button>
        ))}
      </Space>
    </>
  );
}

export default PopupPositionDemo;
