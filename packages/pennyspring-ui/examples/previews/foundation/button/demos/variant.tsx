import React from 'react';
import { Button, Column, Space, Text } from '@pennyspring/ui';

const COLORS = ['primary', 'default', 'danger'] as const;

const VARIANTS = [
  { value: 'solid', label: 'solid 实底' },
  { value: 'filled', label: 'filled 浅底' },
  { value: 'outlined', label: 'outlined 描边' },
  { value: 'dashed', label: 'dashed 虚线' },
  { value: 'text', label: 'text 文字' },
  { value: 'link', label: 'link 链接' },
] as const;

export function ButtonVariantDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        业务优先用 type；需要同一类型换底时才显式传 variant。text / link 不接受 solid
      </Text>
      {VARIANTS.map(({ label, value }) => (
        <Space key={value} direction="vertical" gap="small" align="start">
          <Text color="secondary" size="sm">
            {label}
          </Text>
          <Space align="center" gap="normal" wrap>
            {COLORS.map(color => (
              <Button key={color} color={color} variant={value}>
                {color}
              </Button>
            ))}
          </Space>
        </Space>
      ))}
    </Column>
  );
}

export default ButtonVariantDemo;
