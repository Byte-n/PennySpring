import React from 'react';
import { View } from 'react-native';
import { Space, Button, ActionSheet, Text } from '@pennyspring/ui';
import type { ActionSheetAction } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const ACTIONS: ActionSheetAction[] = [
  { text: '收藏' },
  { text: '分享' },
  { text: '删除', danger: true },
];

const useStyles = createUseSheetStyle(token => ({
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function ActionSheetEventFeedbackDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No action yet');

  return (
    <>
      <Space direction="vertical" size="normal">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
        <Space align="center" size="large" wrap>
          <Button
            type={open ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened action sheet');
              setOpen(true);
            }}
          >
            Open
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
          setLastEvent(`Action ${index}: ${action.text}`)
        }
        titleText="事件反馈"
      />
    </>
  );
}

export default ActionSheetEventFeedbackDemo;
