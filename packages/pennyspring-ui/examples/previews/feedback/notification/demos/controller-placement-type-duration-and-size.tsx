import React from 'react';
import { Space, Button, useNotification } from '@pennyspring/ui';

export const notificationControllerPlacementTypeDurationAndSizeDemoTitle =
  'Controller placement, type, duration and size';

export function NotificationControllerPlacementTypeDurationAndSizeDemo() {
  const notification = useNotification();
  const [_lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <>
      <Space align="center" size="large" wrap>
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
      </Space>
    </>
  );
}

export default NotificationControllerPlacementTypeDurationAndSizeDemo;
