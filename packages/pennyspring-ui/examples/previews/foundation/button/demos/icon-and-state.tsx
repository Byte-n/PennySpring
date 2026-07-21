import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const buttonIconAndStateDemoTitle = 'Icon and state';

export function ButtonIconAndStateDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Button icon="check" type="primary">
          Confirm
        </Button>
        <Button icon="trash" iconPlacement="end" type="danger">
          Remove
        </Button>
        <Button loading>Loading</Button>
        <Button disabled>Disabled</Button>
      </Space>
    </>
  );
}

export default ButtonIconAndStateDemo;
