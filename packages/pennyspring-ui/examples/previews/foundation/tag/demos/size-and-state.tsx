import React from 'react';
import { Space, Tag } from '@pennyspring/ui';

export function TagSizeAndStateDemo() {
  return (
    <>
      <Space align="center" gap="large" wrap>
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
