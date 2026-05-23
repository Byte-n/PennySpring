import React from 'react';
import { View } from 'react-native';
import { Space, Button, Text, Toast } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { ToastPlacement } from '@pennyspring/ui';

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

export const toastDeclarativeMountPointAndAfterOpenChangeDemoTitle =
  'Declarative mountPoint and afterOpenChange';

export function ToastDeclarativeMountPointAndAfterOpenChangeDemo() {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<ToastPlacement>('center');
  const [lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        <Button
          onPress={() => {
            setPlacement('top');
          }}
          type={placement === 'top' ? 'primary' : 'default'}
        >
          Top
        </Button>
        <Button
          onPress={() => {
            setPlacement('center');
          }}
          type={placement === 'center' ? 'primary' : 'default'}
        >
          Center
        </Button>
        <Button
          onPress={() => {
            setPlacement('bottom');
          }}
          type={placement === 'bottom' ? 'primary' : 'default'}
        >
          Bottom
        </Button>
        <Button
          type={open ? 'primary' : 'default'}
          onPress={() => {
            setOpen(current => !current);
          }}
        >
          {open ? 'Hide local toast' : 'Show local toast'}
        </Button>
      </Space>
      <View style={styles.mountPanel}>
        <Text color="secondary" size="sm">
          mountPoint: local
        </Text>
        <Toast
          open={open}
          duration={0}
          placement={placement}
          size="normal"
          mountPoint="local"
          messageText="Local mount toast"
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

export default ToastDeclarativeMountPointAndAfterOpenChangeDemo;
