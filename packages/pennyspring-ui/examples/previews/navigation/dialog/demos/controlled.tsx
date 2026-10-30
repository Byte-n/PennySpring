import React from 'react';
import { Space, Button, Dialog, Text } from '@pennyspring/ui';

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

export function DialogControlledDemo() {
  const [openDialog, setOpenDialog] = React.useState<DialogDemoKey | null>(
    null,
  );
  const [lastEvent, setLastEvent] = React.useState('No dialog action yet');
  const isOpen = (key: DialogDemoKey): boolean => openDialog === key;
  const open = (key: DialogDemoKey): void => {
    setLastEvent(`Opened ${getDialogTitle(key)}`);
    setOpenDialog(key);
  };
  const close = (): void => {
    setOpenDialog(null);
  };

  return (
    <>
      <Space direction="vertical" size="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
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
      </Space>
      <Dialog
        open={isOpen('controlled')}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            close();
          }
        }}
        titleText="Controlled dialog"
        onCancel={({ reason }) =>
          setLastEvent(`Controlled cancelled (${reason})`)
        }
        onOk={() => setLastEvent('Controlled confirmed')}
      >
        <Text color="secondary">
          受控 Dialog 通过 open 与 onOpenChange 双向绑定，按钮高亮态与弹窗开关同步。
        </Text>
      </Dialog>
      <Dialog
        closeOnMaskClick={false}
        open={isOpen('locked')}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            close();
          }
        }}
        titleText="Mask locked dialog"
        onCancel={({ reason }) =>
          setLastEvent(`Mask locked cancelled (${reason})`)
        }
        onOk={() => setLastEvent('Mask locked confirmed')}
      >
        <Text color="secondary">
          closeOnMaskClick 为 false 时遮罩可见但点击不关闭，需通过按钮或硬件返回键关闭。
        </Text>
      </Dialog>
    </>
  );
}

export default DialogControlledDemo;
