import React from 'react';
import { Space, Button } from '@pennyspring/ui';

type DialogDemoKey = 'controlled' | 'disabled' | 'custom' | 'locked';

function getDialogTitle(key: DialogDemoKey): string {
  if (key === 'disabled') {
    return 'Disabled action';
  }

  if (key === 'custom') {
    return 'Custom content';
  }

  if (key === 'locked') {
    return 'Mask locked dialog';
  }

  return 'Controlled dialog';
}

export const dialogControlledDemoTitle = 'Controlled';

export function DialogControlledDemo() {
  const [openDialog, setOpenDialog] = React.useState<DialogDemoKey | null>(
    null,
  );
  const [_lastEvent, setLastEvent] = React.useState('No dialog action yet');
  const isOpen = (key: DialogDemoKey): boolean => openDialog === key;
  const open = (key: DialogDemoKey): void => {
    setLastEvent(`Opened ${getDialogTitle(key)}`);
    setOpenDialog(key);
  };

  return (
    <>
      <Space align="center" size="large" wrap>
        <Button
          type={isOpen('controlled') ? 'primary' : 'default'}
          onPress={() => {
            open('controlled');
          }}
        >
          Open
        </Button>
        <Button
          type={isOpen('locked') ? 'primary' : 'default'}
          onPress={() => {
            open('locked');
          }}
        >
          Mask locked
        </Button>
      </Space>
    </>
  );
}

export default DialogControlledDemo;
