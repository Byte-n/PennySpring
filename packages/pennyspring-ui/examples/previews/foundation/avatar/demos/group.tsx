import React from 'react';
import { Avatar, Column, Text } from '@pennyspring/ui';
import type { AvatarGroupItem } from '@pennyspring/ui';

const AVATAR_ITEMS: AvatarGroupItem[] = [
  { key: 'wang', text: '王' },
  { key: 'li', text: '李' },
  { key: 'chen', text: '陈' },
  { key: 'zhao', text: '赵' },
  { key: 'zhou', text: '周' },
  { key: 'wu', text: '吴' },
  { key: 'zheng', text: '郑' },
];

export function AvatarGroupDemo() {
  return (
    <Column gap="normal">
      <Column gap="small">
        <Text color="tertiary" size="xs">
          small · 28 · max 3 · 重叠 8
        </Text>
        <Avatar.Group items={AVATAR_ITEMS} maxCount={3} size="small" />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">
          normal · 40 · max 4 · 重叠 10
        </Text>
        <Avatar.Group items={AVATAR_ITEMS} maxCount={4} size="normal" />
      </Column>
      <Column gap="small">
        <Text color="tertiary" size="xs">
          large · 56 · max 3 · 重叠 14
        </Text>
        <Avatar.Group items={AVATAR_ITEMS} maxCount={3} size="large" />
      </Column>
      <Text color="tertiary" size="xs">
        每个头像外套 2px colorBgContainer 环；+N 与头像同尺寸、999
        胶囊，文字与首字同档
      </Text>
    </Column>
  );
}

export default AvatarGroupDemo;
