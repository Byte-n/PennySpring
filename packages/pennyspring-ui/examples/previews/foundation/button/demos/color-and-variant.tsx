import React from 'react';
import { Space, Button } from '@pennyspring/ui';

export const buttonColorAndVariantDemoTitle = 'Color and variant';

export function ButtonColorAndVariantDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Button color="green" variant="solid">
          Green
        </Button>
        <Button color="gold" variant="filled">
          Gold
        </Button>
        <Button danger>Danger</Button>
        <Button color="purple" variant="outlined">
          Outlined
        </Button>
        <Button color="cyan" variant="dashed">
          Dashed
        </Button>
      </Space>
    </>
  );
}

export default ButtonColorAndVariantDemo;
