import React from 'react';
import { Space, Icon } from '@pennyspring/ui';
import type { IconColor } from '@pennyspring/ui';

const SEMANTIC_COLORS: IconColor[] = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
];

const ALIAS_COLORS: IconColor[] = ['textDescription', 'primary', 'link'];

export const iconSizeAndColorDemoTitle = 'Size and color';

export function IconSizeAndColorDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Icon icon="home" size="small" />
        <Icon icon="home" size="normal" />
        <Icon icon="home" size="large" />
        <Icon icon="home" size={28} />
      </Space>
      <Space align="center" size="large" wrap>
        {SEMANTIC_COLORS.map(color => (
          <Icon key={color} icon="check-circle" color={color} />
        ))}
      </Space>
      <Space align="center" size="large" wrap>
        {ALIAS_COLORS.map(color => (
          <Icon key={color} icon="warning" color={color} />
        ))}
      </Space>
    </>
  );
}

export default IconSizeAndColorDemo;
