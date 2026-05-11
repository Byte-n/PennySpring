import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Text,
  ToastPortal,
  toast,
} from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../PreviewScaffold';
import type { ToastPosition, ToastType } from '@pennyspring/component';

const useStyles = createUseSheetStyle(token => ({
  statusLine: {
    paddingVertical: token.paddingXXS,
  },
}));

function ToastDemo() {
  const styles = useStyles();
  const [lastEvent, setLastEvent] = React.useState('No toast action yet');

  const showToast = (
    type: ToastType,
    position: ToastPosition = 'bottom',
  ): void => {
    const label = `${type} at ${position}`;
    setLastEvent(`Showing ${label}`);
    toast.show({
      contentText: `${type.charAt(0).toUpperCase() + type.slice(1)} toast message`,
      type,
      position,
      duration: 2000,
      onCancel: () => setLastEvent(`${label} dismissed`),
    });
  };

  return (
    <PreviewScaffold>
      <PreviewSection title="Types">
        <PreviewRow>
          <Button onPress={() => showToast('info')}>Info</Button>
          <Button onPress={() => showToast('success')}>Success</Button>
          <Button onPress={() => showToast('fail')}>Fail</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Positions">
        <PreviewRow>
          <Button onPress={() => showToast('info', 'top')}>Top</Button>
          <Button onPress={() => showToast('info', 'center')}>Center</Button>
          <Button onPress={() => showToast('info', 'bottom')}>Bottom</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Sizes">
        <PreviewRow>
          <Button
            onPress={() =>
              toast.show({
                contentText: 'Small toast',
                size: 'small',
                duration: 2000,
              })
            }
          >
            Small
          </Button>
          <Button
            onPress={() =>
              toast.show({
                contentText: 'Normal toast',
                size: 'normal',
                duration: 2000,
              })
            }
          >
            Normal
          </Button>
          <Button
            onPress={() =>
              toast.show({
                contentText: 'Large toast',
                size: 'large',
                duration: 2000,
              })
            }
          >
            Large
          </Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Persistent">
        <PreviewRow>
          <Button
            onPress={() =>
              toast.show({
                contentText: 'Persistent toast (duration 0)',
                duration: 0,
                mask: true,
              })
            }
          >
            Show persistent
          </Button>
          <Button onPress={() => toast.clear()}>Clear all</Button>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Event feedback">
        <View style={styles.statusLine}>
          <Text color="description" size="sm">
            {lastEvent}
          </Text>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}

export function ToastPreview() {
  return (
    <>
      <ToastDemo />
      <ToastPortal />
    </>
  );
}
