import React from 'react';
import { Space, Icon } from '@pennyspring/ui';

export const iconWeightAndMirroredDemoTitle = 'Weight and mirrored';

export function IconWeightAndMirroredDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Icon icon="heart" weight="thin" />
        <Icon icon="heart" weight="regular" />
        <Icon icon="heart" weight="fill" />
        <Icon icon="arrow-right" mirrored />
        <Icon icon="caret-right" mirrored />
      </Space>
    </>
  );
}

export default IconWeightAndMirroredDemo;
