import React from 'react';
import { Space, Tag } from '@pennyspring/ui';
import type { TagColor } from '@pennyspring/ui';

const SEMANTIC_COLORS: TagColor[] = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
];

export function TagSemanticColorsDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        {SEMANTIC_COLORS.map(color => (
          <Tag key={color} color={color}>
            {color}
          </Tag>
        ))}
      </Space>
      <Space align="center" size="large" wrap>
        {SEMANTIC_COLORS.map(color => (
          <Tag key={`${color}-outlined`} color={color} variant="outlined">
            {color}
          </Tag>
        ))}
      </Space>
      <Space align="center" size="large" wrap>
        {SEMANTIC_COLORS.map(color => (
          <Tag key={`${color}-solid`} color={color} variant="solid">
            {color}
          </Tag>
        ))}
      </Space>
    </>
  );
}

export default TagSemanticColorsDemo;
