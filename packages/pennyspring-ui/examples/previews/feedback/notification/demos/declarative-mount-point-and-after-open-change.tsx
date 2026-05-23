import React from 'react';
import { View } from 'react-native';
import { Space, Button, Notification, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { NotificationPlacement, NotificationType } from '@pennyspring/ui';

const MOUNT_PANEL_MIN_HEIGHT_FACTOR = 4;

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

export const notificationDeclarativeMountPointAndAfterOpenChangeDemoTitle =
  'Declarative mountPoint and afterOpenChange';

export function NotificationDeclarativeMountPointAndAfterOpenChangeDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] =
    React.useState<NotificationPlacement>('top-right');
  const [type, setType] = React.useState<NotificationType>('info');
  const [lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        <Button
          type={placement === 'top-right' ? 'primary' : 'default'}
          onPress={() => {
            setPlacement('top-right');
          }}
        >
          Top-right
        </Button>
        <Button
          type={placement === 'bottom-right' ? 'primary' : 'default'}
          onPress={() => {
            setPlacement('bottom-right');
          }}
        >
          Bottom-right
        </Button>
        <Button
          type={type === 'info' ? 'primary' : 'default'}
          onPress={() => {
            setType('info');
          }}
        >
          Info
        </Button>
        <Button
          type={type === 'error' ? 'primary' : 'default'}
          onPress={() => {
            setType('error');
          }}
        >
          Error
        </Button>
        <Button
          type={open ? 'primary' : 'default'}
          onPress={() => {
            setOpen(current => !current);
          }}
        >
          {open ? 'Hide local notification' : 'Show local notification'}
        </Button>
      </Space>
      <View style={styles.mountPanel}>
        <Text color="secondary" size="sm">
          mountPoint: local
        </Text>
        <Notification
          open={open}
          duration={0}
          placement={placement}
          size="normal"
          type={type}
          mountPoint="local"
          titleText="Local notification"
          descriptionText="Mounted in this preview section"
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

export default NotificationDeclarativeMountPointAndAfterOpenChangeDemo;
