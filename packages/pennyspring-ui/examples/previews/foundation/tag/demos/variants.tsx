import React from 'react';
import { Space, Tag } from '@pennyspring/ui';

export const tagVariantsDemoTitle = 'Variants';

export function TagVariantsDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Tag color="primary" variant="filled">
          Filled
        </Tag>
        <Tag color="primary" variant="outlined">
          Outlined
        </Tag>
        <Tag color="primary" variant="solid">
          Solid
        </Tag>
        <Tag color="danger" variant="solid">
          Danger
        </Tag>
      </Space>
    </>
  );
}

export default TagVariantsDemo;
