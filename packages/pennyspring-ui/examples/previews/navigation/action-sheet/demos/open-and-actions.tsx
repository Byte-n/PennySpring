import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const actionSheetOpenAndActionsDemoTitle = 'Open and actions';

export function ActionSheetOpenAndActionsDemo() {
  const [open, setOpen] = React.useState(false);
  const [_eventText, setEventText] = React.useState('No action yet');

  return (
    <>
      <Space align="center" size="large" wrap>
        <Button
          type={open ? 'primary' : 'default'}
          onPress={() => {
            setEventText('Opened action sheet');
            setOpen(true);
          }}
        >
          Open ActionSheet
        </Button>
      </Space>
    </>
  );
}

export default ActionSheetOpenAndActionsDemo;
