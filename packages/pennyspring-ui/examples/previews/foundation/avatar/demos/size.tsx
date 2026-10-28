import React from 'react';
import { Avatar, Column, Row, Text } from '@pennyspring/ui';
import type { ComponentSize } from '@pennyspring/ui';

export const avatarSizeDemoTitle = '尺寸（size）';

const SIZE_SAMPLES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 28 · 方角 8 · 首字 12' },
  { size: 'normal', hint: 'normal · 40 · 方角 12 · 首字 14' },
  { size: 'large', hint: 'large · 56 · 方角 16 · 首字 18' },
];

export function AvatarSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(({ size, hint }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="xs">{hint}</Text>
          <Row gap="small">
            <Avatar size={size} text="王" />
            <Avatar shape="square" size={size} text="李" />
            <Avatar size={size} />
          </Row>
        </Column>
      ))}
      <Text color="tertiary" size="xs">
        圆形用 999；方形圆角取 borderRadiusSM / borderRadius / borderRadiusLG；空态渲染 16 / 20 / 26 的人物占位图标
      </Text>
    </Column>
  );
}

export default AvatarSizeDemo;
