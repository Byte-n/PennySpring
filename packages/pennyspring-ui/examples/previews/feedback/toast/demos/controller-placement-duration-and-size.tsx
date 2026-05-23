import React from 'react';
import { Space, Button, useToast } from '@pennyspring/ui';

export const toastControllerPlacementDurationAndSizeDemoTitle =
  'Controller placement, duration and size';

export function ToastControllerPlacementDurationAndSizeDemo() {
  const toast = useToast();
  const [_lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <>
      <Space align="center" size="large" wrap>
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
      </Space>
    </>
  );
}

export default ToastControllerPlacementDurationAndSizeDemo;
