import React from 'react';
import { View } from 'react-native';
import { Button, Text, Toast, useToast } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../../PreviewScaffold';
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

export function ToastPreview() {
  const styles = useStyles();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [placement, setPlacement] = React.useState<ToastPlacement>('center');
  const [lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <PreviewScaffold>
      <PreviewSection title="Controller placement, duration and size">
        <PreviewRow>
          <Button
            onPress={() => {
              toast.show({
                messageText: 'Top small toast (duration 1200ms)',
                placement: 'top',
                size: 'small',
                duration: 1200,
              });
            }}
          >
            Top / small
          </Button>
          <Button
            onPress={() => {
              toast.show({
                messageText: 'Bottom large toast (duration 2800ms)',
                placement: 'bottom',
                size: 'large',
                duration: 2800,
              });
            }}
          >
            Bottom / large
          </Button>
          <Button
            onPress={() => {
              toast.clear();
              setLastEvent('Cleared all toast instances');
            }}
          >
            Clear
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Declarative mountPoint and afterOpenChange">
        <PreviewRow>
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
        </PreviewRow>
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
