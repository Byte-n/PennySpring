import React from 'react';
import { View } from 'react-native';
import { Space, Button, Dialog, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function DialogEventFeedbackDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No dialog action yet');

  return (
    <>
      <Space direction="vertical" gap="normal">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
        <Space align="center" gap="large" wrap>
          <Button
            type={open ? 'primary' : 'default'}
            onPress={() => {
              setLastEvent('Opened dialog');
              setOpen(true);
            }}
          >
            Open
          </Button>
        </Space>
      </Space>
      <Dialog
        open={open}
        onOpenChange={nextOpen => {
          setOpen(nextOpen);
        }}
        titleText="事件反馈"
        onCancel={({ reason }) => setLastEvent(`Cancelled (${reason})`)}
        onOk={() => setLastEvent('Confirmed (ok)')}
      >
        <Text color="secondary">
          点击遮罩触发 onCancel（reason: mask），按下硬件返回键触发 onCancel（reason: back），确定按钮触发 onOk。状态行实时显示最近一次事件。
        </Text>
      </Dialog>
    </>
  );
}

export default DialogEventFeedbackDemo;
