import React from 'react';
import { Avatar } from '@pennyspring/ui';
import { useTheme } from '@pennyspring/theme';
import type { AvatarGroupItem } from '@pennyspring/ui';

const AVATAR_ITEMS: AvatarGroupItem[] = [
  { key: 'april', text: 'AP' },
  { key: 'spring', text: 'SP' },
  { key: 'penny', text: 'PN' },
  { key: 'kaori', text: 'KR' },
];

export const avatarGroupDemoTitle = 'Group';

export function AvatarGroupDemo() {
  const { token } = useTheme();

  return (
    <>
      <Avatar.Group
        items={AVATAR_ITEMS}
        maxCount={token.lineWidthBold + token.lineWidthBold + token.lineWidth}
      />
    </>
  );
}

export default AvatarGroupDemo;
