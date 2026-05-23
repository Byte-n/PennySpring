import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const buttonTypeDemoTitle = 'Type';

export function ButtonTypeDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="text">Text</Button>
        <Button type="link">Link</Button>
      </Space>
    </>
  );
}

export default ButtonTypeDemo;
