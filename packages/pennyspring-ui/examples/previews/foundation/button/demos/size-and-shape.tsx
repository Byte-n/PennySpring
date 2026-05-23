import React from 'react';
import { Space, Button } from '@pennyspring/ui';
import { PlusIcon } from 'phosphor-react-native';

const BUTTON_SIZES = ['small', 'normal', 'large'] as const;

export const buttonSizeAndShapeDemoTitle = 'Size and shape';

export function ButtonSizeAndShapeDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        {BUTTON_SIZES.map(size => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
        <Button shape="round" type="primary">
          Round
        </Button>
        <Button icon={PlusIcon} shape="circle" />
      </Space>
    </>
  );
}

export default ButtonSizeAndShapeDemo;
