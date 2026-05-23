import React from 'react';
import { Space, Button } from '@pennyspring/ui';

type PopupAnimationDemo = 'slide' | 'fade' | 'none';

export const popupAnimationDemoTitle = 'Animation';

export function PopupAnimationDemo() {
  const [animation, setAnimation] = React.useState<PopupAnimationDemo>('slide');
  const [_lastEvent, setLastEvent] = React.useState('No popup action yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        {(['slide', 'fade', 'none'] as const).map(item => (
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
    </>
  );
}

export default PopupAnimationDemo;
