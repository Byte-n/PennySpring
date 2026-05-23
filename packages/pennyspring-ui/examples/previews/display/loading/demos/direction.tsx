import React from 'react';
import { Space, Loading } from '@pennyspring/ui';

export const loadingDirectionDemoTitle = 'Direction';

export function LoadingDirectionDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Loading text="Horizontal" />
        <Loading text="Vertical" vertical />
      </Space>
    </>
  );
}

export default LoadingDirectionDemo;
