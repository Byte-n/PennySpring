import React from 'react';
import { View } from 'react-native';
import { Button, notification, NotificationPortal, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import {
  PreviewRow,
  PreviewScaffold,
  PreviewSection,
} from '../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXS,
  },
}));

function ImperativeDemo() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <NotificationPortal />
      <PreviewSection title="Type variants">
        <View style={styles.buttonGroup}>
          <Button
            onPress={() => {
              notification.info({
                titleText: 'Information',
                contentText: 'This is an informational notification.',
              });
            }}
          >
            Info
          </Button>
          <Button
            onPress={() => {
              notification.success({
                titleText: 'Success',
                contentText: 'Operation completed successfully.',
              });
            }}
          >
            Success
          </Button>
          <Button
            onPress={() => {
              notification.warning({
                titleText: 'Warning',
                contentText: 'Please review before proceeding.',
              });
            }}
          >
            Warning
          </Button>
          <Button
            onPress={() => {
              notification.error({
                titleText: 'Error',
                contentText: 'Something went wrong. Please try again.',
              });
            }}
          >
            Error
          </Button>
        </View>
      </PreviewSection>

      <PreviewSection title="Features">
        <View style={styles.buttonGroup}>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'Closeable',
                contentText: 'This notification has a close button.',
                closeable: true,
              });
            }}
          >
            Closeable
          </Button>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'Persistent',
                contentText: 'This notification stays until dismissed.',
                duration: 0,
                closeable: true,
              });
            }}
          >
            Persistent
          </Button>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'With Description',
                contentText: 'Main content here.',
                descriptionText: 'Additional details and context for the notification.',
                closeable: true,
              });
            }}
          >
            With description
          </Button>
          <Button
            onPress={() => {
              notification.clear();
            }}
          >
            Clear all
          </Button>
        </View>
      </PreviewSection>

      <PreviewSection title="Size variants">
        <View style={styles.buttonGroup}>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'Small notification',
                contentText: 'Compact size for brief messages.',
                size: 'small',
              });
            }}
          >
            Small
          </Button>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'Normal notification',
                contentText: 'Standard size for regular notifications.',
                size: 'normal',
              });
            }}
          >
            Normal
          </Button>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'Large notification',
                contentText: 'Expanded size for detailed information.',
                size: 'large',
                descriptionText: 'Extra details in large size.',
              });
            }}
          >
            Large
          </Button>
        </View>
      </PreviewSection>

      <PreviewSection title="Callbacks">
        <View style={styles.buttonGroup}>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'Pressable',
                contentText: 'Tap this notification to trigger onPress.',
                onPress: () => {
                  notification.info({
                    titleText: 'Pressed!',
                    contentText: 'onPress callback was triggered.',
                  });
                },
              });
            }}
          >
            onPress
          </Button>
          <Button
            onPress={() => {
              notification.open({
                titleText: 'With onCancel',
                contentText: 'Dismiss to see the callback.',
                duration: 2000,
                onCancel: () => {
                  notification.info({
                    titleText: 'Cancelled',
                    contentText: 'onCancel callback was triggered.',
                  });
                },
              });
            }}
          >
            onCancel
          </Button>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}

export function NotificationPreview() {
  return <ImperativeDemo />;
}
