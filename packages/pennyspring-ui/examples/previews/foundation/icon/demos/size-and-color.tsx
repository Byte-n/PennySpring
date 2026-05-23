import React from 'react';
import { Space, Icon } from '@pennyspring/ui';

export const iconSizeAndColorDemoTitle = 'Size and color';

export function IconSizeAndColorDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Icon icon="home" size="small" />
        <Icon icon="home" size="normal" />
        <Icon icon="home" size="large" />
        <Icon icon="home" size={28} />
        <Icon icon="warning" color="colorWarning" />
        <Icon icon="check-circle" color="colorSuccess" />
        <Icon icon="close-circle" color="colorError" />
      </Space>
    </>
  );
}

export default IconSizeAndColorDemo;
