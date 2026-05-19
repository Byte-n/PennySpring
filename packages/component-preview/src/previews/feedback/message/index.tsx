import React from 'react';
import { View } from 'react-native';
import { Button, Message, Text, useMessage } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
import type { MessagePlacement, MessageType } from '@pennyspring/component';

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

export function MessagePreview() {
  const styles = useStyles();
  const message = useMessage();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<MessagePlacement>('top');
  const [type, setType] = React.useState<MessageType>('success');
  const [lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <PreviewScaffold>
      <PreviewSection title="Controller type, placement, duration and size">
        <PreviewRow>
          <Button
            onPress={() => {
              message.show({
                messageText: 'Top success message (1200ms)',
                type: 'success',
                placement: 'top',
                size: 'small',
                duration: 1200,
              });
            }}
          >
            Top success
          </Button>
          <Button
            onPress={() => {
              message.show({
                messageText: 'Bottom error message (2600ms)',
                type: 'error',
                placement: 'bottom',
                size: 'large',
                duration: 2600,
              });
            }}
          >
            Bottom error
          </Button>
          <Button
            onPress={() => {
              message.clear();
              setLastEvent('Cleared all message instances');
            }}
          >
            Clear
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Declarative mountPoint and afterOpenChange">
        <PreviewRow>
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
        </PreviewRow>
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
