import React from 'react';
import { Space, Icon } from '@pennyspring/ui';
import type { IconColor } from '@pennyspring/ui';

const SEMANTIC_COLORS: IconColor[] = [
  'base',
  'default',
  'secondary',
  'tertiary',
  'quaternary',
  'heading',
  'label',
  'description',
  'disabled',
  'placeholder',
  'lightSolid',
];

const ALIAS_COLORS: IconColor[] = ['textDescription', 'primary', 'link'];

export function IconSizeAndColorDemo() {
  return (
    <>
      <Space align="center" gap="large" wrap>
        <Icon icon="home" size="small" />
        <Icon icon="home" size="normal" />
        <Icon icon="home" size="large" />
      </Space>
      <Space align="center" gap="large" wrap>
        {SEMANTIC_COLORS.map(color => (
          <Icon key={color} icon="check-circle" color={color} />
        ))}
      </Space>
      <Space align="center" gap="large" wrap>
        {ALIAS_COLORS.map(color => (
          <Icon key={color} icon="warning" color={color} />
        ))}
      </Space>
    </>
  );
}

export default IconSizeAndColorDemo;
