import React from 'react';
import { Space, Button } from '@pennyspring/ui';

type DrawerPosition = 'left' | 'right';

const DRAWER_POSITIONS: DrawerPosition[] = ['left', 'right'];

export const drawerControlledDemoTitle = 'Controlled';

export function DrawerControlledDemo() {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<DrawerPosition>('left');
  const openDrawer = React.useCallback((nextPosition: DrawerPosition) => {
    setPosition(nextPosition);
    setOpen(true);
  }, []);

  return (
    <>
      <Space align="center" size="large" wrap>
        {DRAWER_POSITIONS.map(item => (
          <Button
            key={item}
            type={open && position === item ? 'primary' : 'default'}
            onPress={() => {
              openDrawer(item);
            }}
          >
            Open {item}
          </Button>
        ))}
      </Space>
    </>
  );
}

export default DrawerControlledDemo;
