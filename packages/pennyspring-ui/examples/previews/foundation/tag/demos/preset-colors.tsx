import React from 'react';
import { Space, Tag } from '@pennyspring/ui';
import type { TagColor } from '@pennyspring/ui';

const PRESET_COLORS: TagColor[] = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'gold',
];

export function TagPresetColorsDemo() {
  return (
    <>
      <Space align="center" gap="large" wrap>
        {PRESET_COLORS.map(color => (
          <Tag key={color} color={color} variant="outlined">
            {color}
          </Tag>
        ))}
      </Space>
    </>
  );
}

export default TagPresetColorsDemo;
