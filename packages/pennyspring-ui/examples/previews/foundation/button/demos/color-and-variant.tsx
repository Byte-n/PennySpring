import React from 'react';
import { Space, Button, Divider } from '@pennyspring/ui';

export const buttonColorAndVariantDemoTitle = 'Color and variant';

const COLORS = [
  'default',
  'primary',
  'danger',
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const;

const VARIANTS = ['solid', 'outlined', 'dashed', 'filled', 'text', 'link'] as const;

export function ButtonColorAndVariantDemo() {
  return (
    <>
      {VARIANTS.map(variant => (
        <React.Fragment key={variant}>
          <Divider contentPosition="left">{variant}</Divider>
          <Space align="center" size="large" wrap>
            {COLORS.map(color => (
              <Button key={color} color={color} variant={variant}>
                {color}
              </Button>
            ))}
          </Space>
        </React.Fragment>
      ))}
    </>
  );
}

export default ButtonColorAndVariantDemo;
