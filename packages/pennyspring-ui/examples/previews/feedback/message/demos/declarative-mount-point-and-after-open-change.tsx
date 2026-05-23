import React from 'react';
import { View } from 'react-native';
import { Space, Button, Message, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { MessagePlacement, MessageType } from '@pennyspring/ui';

const MOUNT_PANEL_MIN_HEIGHT_FACTOR = 3;

const useStyles = createUseSheetStyle(token => ({
  mountPanel: {
    minHeight: token.controlHeightLG * MOUNT_PANEL_MIN_HEIGHT_FACTOR,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
    padding: token.paddingSM,
    gap: token.marginXXS,
  },
}));

export const messageDeclarativeMountPointAndAfterOpenChangeDemoTitle =
  'Declarative mountPoint and afterOpenChange';

export function MessageDeclarativeMountPointAndAfterOpenChangeDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<MessagePlacement>('top');
  const [type, setType] = React.useState<MessageType>('success');
  const [lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        <Button
          type={placement === 'top' ? 'primary' : 'default'}
          onPress={() => {
            setPlacement('top');
          }}
        >
          Top
        </Button>
        <Button
          type={placement === 'bottom' ? 'primary' : 'default'}
          onPress={() => {
            setPlacement('bottom');
          }}
        >
          Bottom
        </Button>
        <Button
          type={type === 'success' ? 'primary' : 'default'}
          onPress={() => {
            setType('success');
          }}
        >
          Success
        </Button>
        <Button
          type={type === 'warning' ? 'primary' : 'default'}
          onPress={() => {
            setType('warning');
          }}
        >
          Warning
        </Button>
        <Button
          type={open ? 'primary' : 'default'}
          onPress={() => {
            setOpen(current => !current);
          }}
        >
          {open ? 'Hide local message' : 'Show local message'}
        </Button>
      </Space>
      <View style={styles.mountPanel}>
        <Text color="secondary" size="sm">
          mountPoint: local
        </Text>
        <Message
          open={open}
          duration={0}
          placement={placement}
          size="normal"
          type={type}
          mountPoint="local"
          messageText="Local mount message"
          onOpenChange={nextOpen => {
            setOpen(nextOpen);
            setLastEvent(`onOpenChange: ${String(nextOpen)}`);
          }}
          afterOpenChange={nextOpen => {
            setLastEvent(`afterOpenChange: ${String(nextOpen)}`);
          }}
        />
      </View>
      <Text color="description" size="sm">
        {lastEvent}
      </Text>
    </>
  );
}

export default MessageDeclarativeMountPointAndAfterOpenChangeDemo;
