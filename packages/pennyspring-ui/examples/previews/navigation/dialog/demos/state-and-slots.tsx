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

export const dialogStateAndSlotsDemoTitle = 'State and slots';

export function DialogStateAndSlotsDemo() {
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
          type={isOpen('disabled') ? 'primary' : 'default'}
          onPress={() => {
            open('disabled');
          }}
        >
          Open disabled action
        </Button>
        <Button
          type={isOpen('custom') ? 'primary' : 'default'}
          onPress={() => {
            open('custom');
          }}
        >
          Open custom slots
        </Button>
      </Space>
    </>
  );
}

export default DialogStateAndSlotsDemo;
