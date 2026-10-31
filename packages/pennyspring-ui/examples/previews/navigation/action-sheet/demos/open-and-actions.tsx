import React from 'react';
import { Space, Button, ActionSheet, Text } from '@pennyspring/ui';
import type { ActionSheetAction } from '@pennyspring/ui';

const ACTIONS: ActionSheetAction[] = [
  { text: '收藏' },
  { text: '编辑' },
  { text: '分享' },
  { text: '删除', description: '不可恢复', danger: true },
];

export function ActionSheetOpenAndActionsDemo() {
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No action yet');

  return (
    <>
      <Space direction="vertical" gap="small">
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
        <Space align="center" gap="large" wrap>
          <Button
            type={open ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened action sheet');
              setOpen(true);
            }}
          >
            Open ActionSheet
          </Button>
        </Space>
      </Space>
      <ActionSheet
        actions={ACTIONS}
        cancelText="取消"
        open={open}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setOpen(false);
          }
        }}
        onCancel={({ reason }) => setLastEvent(`Cancelled (${reason})`)}
        onAction={(action, index) =>
          setLastEvent(
            `Action ${index}: ${action.text}${action.danger ? ' (danger)' : ''}`,
          )
        }
        titleText="选择操作"
      />
    </>
  );
}

export default ActionSheetOpenAndActionsDemo;
