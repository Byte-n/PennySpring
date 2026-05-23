import React from 'react';
import { Space, Avatar } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

const SIZES: ComponentSize[] = ['small', 'normal', 'large'];

export const avatarSizeDemoTitle = 'Size';

export function AvatarSizeDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        {SIZES.map(size => (
          <Avatar key={size} size={size} text={size.slice(0, 2)} />
        ))}
      </Space>
    </>
  );
}

export default AvatarSizeDemo;
