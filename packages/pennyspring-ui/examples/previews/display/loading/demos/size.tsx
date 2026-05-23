import React from 'react';
import { Space, Loading } from '@pennyspring/ui';

export const loadingSizeDemoTitle = 'Size';

export function LoadingSizeDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Loading size="small" text="Small" />
        <Loading size="normal" text="Normal" />
        <Loading size="large" text="Large" />
      </Space>
    </>
  );
}

export default LoadingSizeDemo;
