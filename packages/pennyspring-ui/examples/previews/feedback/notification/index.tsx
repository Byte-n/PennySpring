import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Notification,
  Text,
  useNotification,
} from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
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

export function NotificationPreview() {
  const styles = useStyles();
  const notification = useNotification();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] =
    React.useState<NotificationPlacement>('top-right');
  const [type, setType] = React.useState<NotificationType>('info');
  const [lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <PreviewScaffold>
      <PreviewSection title="Controller placement, type, duration and size">
        <PreviewRow>
          <Button
            onPress={() => {
              notification.show({
                titleText: 'Top right success',
                descriptionText: 'Duration 1500ms, size small',
                placement: 'top-right',
                type: 'success',
                size: 'small',
                duration: 1500,
              });
            }}
          >
            Top-right success
          </Button>
          <Button
            onPress={() => {
              notification.show({
                titleText: 'Bottom left warning',
                descriptionText: 'Duration 3000ms, size large',
                placement: 'bottom-left',
                type: 'warning',
                size: 'large',
                duration: 3000,
              });
            }}
          >
            Bottom-left warning
          </Button>
          <Button
            onPress={() => {
              notification.clear();
              setLastEvent('Cleared all notification instances');
            }}
          >
            Clear
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Declarative mountPoint and afterOpenChange">
        <PreviewRow>
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
        </PreviewRow>
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
