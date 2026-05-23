import React from 'react';
import { Space, Tag } from '@pennyspring/ui';

export const tagSizeAndStateDemoTitle = 'Size and state';

export function TagSizeAndStateDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Tag size="small">Small</Tag>
        <Tag>Normal</Tag>
        <Tag size="large">Large</Tag>
        <Tag color="success" onPress={() => undefined}>
          Pressable
        </Tag>
        <Tag disabled>Disabled</Tag>
      </Space>
    </>
  );
}

export default TagSizeAndStateDemo;
