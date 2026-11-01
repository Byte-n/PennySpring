import React from 'react';
import { View } from 'react-native';
import { Space, Button, Popup, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

export function PopupEventFeedbackDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [lastEvent, setLastEvent] = React.useState('No popup action yet');

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
              setLastEvent('Opened popup');
              setOpen(true);
            }}
          >
            Open
          </Button>
        </Space>
      </Space>
      <Popup
        onCancel={({ reason }) => {
          setLastEvent(`Cancelled (reason: ${reason})`);
          setOpen(false);
        }}
        onOpenChange={(nextOpen, { reason }) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setLastEvent(`OpenChange closed (reason: ${reason})`);
          }
        }}
        open={open}
      >
        <Space direction="vertical" gap="normal">
          <Text color="heading" size="lg" weight="strong">
            事件反馈
          </Text>
          <Text color="secondary">
            点击遮罩会触发 onCancel 并携带 reason: mask；按下硬件返回键会携带
            reason: back。状态行会实时显示最近一次事件。
          </Text>
          <Space justify="end" gap="small">
            <Button type="primary" onPress={() => setOpen(false)}>
              编程式关闭
            </Button>
          </Space>
        </Space>
      </Popup>
    </>
  );
}

export default PopupEventFeedbackDemo;
