import React from 'react';
import { Space, Button, Dialog, Text, Column } from '@pennyspring/ui';

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

export function DialogStateAndSlotsDemo() {
  const [openDialog, setOpenDialog] = React.useState<DialogDemoKey | null>(
    null,
  );
  const [lastEvent, setLastEvent] = React.useState('No dialog action yet');
  const [acknowledged, setAcknowledged] = React.useState(false);
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
      </Space>
      <Dialog
        open={isOpen('disabled')}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setAcknowledged(false);
            close();
          }
        }}
        titleText="Disabled action"
        okDisabled={!acknowledged}
        onCancel={({ reason }) =>
          setLastEvent(`Disabled cancelled (${reason})`)
        }
        onOk={() => setLastEvent('Disabled confirmed')}
      >
        <Text color="secondary">
          确定按钮通过 okDisabled 受控：点击下方按钮完成确认后，确定才会启用。
        </Text>
        <Button
          type={acknowledged ? 'primary' : 'default'}
          onPress={() => {
            setAcknowledged(prev => !prev);
            setLastEvent(acknowledged ? 'Acknowledgement cleared' : 'Acknowledged');
          }}
        >
          {acknowledged ? '已确认' : '点击确认'}
        </Button>
      </Dialog>
      <Dialog
        open={isOpen('custom')}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            close();
          }
        }}
        title={
          <Column gap="small">
            <Text color="heading" size="lg" weight="strong">
              自定义标题
            </Text>
            <Text color="description" size="sm">
              title 可传入任意节点
            </Text>
          </Column>
        }
        cancel={<Text>稍后</Text>}
        ok={<Text weight="strong">立即应用</Text>}
        onCancel={({ reason }) => setLastEvent(`Custom cancelled (${reason})`)}
        onOk={() => setLastEvent('Custom confirmed')}
      >
        <Text color="secondary">
          title、cancel、ok 与 children 均支持自定义节点，按需组合。
        </Text>
      </Dialog>
    </>
  );
}

export default DialogStateAndSlotsDemo;
