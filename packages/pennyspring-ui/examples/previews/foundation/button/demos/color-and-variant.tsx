import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const buttonColorAndVariantDemoTitle = 'Color and variant';

export function ButtonColorAndVariantDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Button color="default" variant="solid">
          Default
        </Button>
        <Button color="primary" variant="solid">
          Primary
        </Button>
        <Button color="danger" variant="solid">
          Danger
        </Button>
      </Space>
      <Space align="center" size="large" wrap>
        <Button color="green" variant="filled">
          Green
        </Button>
        <Button color="gold" variant="outlined">
          Gold
        </Button>
        <Button color="purple" variant="dashed">
          Purple
        </Button>
      </Space>
      <Space align="center" size="large" wrap>
        <Button color="cyan" variant="text">
          Cyan Text
        </Button>
        <Button color="blue" variant="link">
          Blue Link
        </Button>
      </Space>
    </>
  );
}

export default ButtonColorAndVariantDemo;
