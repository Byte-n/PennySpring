import React from 'react';
import { Space, Button, useMessage } from '@pennyspring/ui';

export const messageControllerTypePlacementDurationAndSizeDemoTitle =
  'Controller type, placement, duration and size';

export function MessageControllerTypePlacementDurationAndSizeDemo() {
  const message = useMessage();
  const [_lastEvent, setLastEvent] = React.useState('No event yet');

  return (
    <>
      <Space align="center" size="large" wrap>
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
      </Space>
    </>
  );
}

export default MessageControllerTypePlacementDurationAndSizeDemo;
