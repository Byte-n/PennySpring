import React from 'react';
import { Space, Avatar, Badge } from '@pennyspring/ui';

export const badgeCountAndDotDemoTitle = 'Count and dot';

export function BadgeCountAndDotDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Badge count={8}>
          <Avatar size="large" text="PS" />
        </Badge>
        <Badge count={128} overflowCount={99}>
          <Avatar size="large" text="OV" />
        </Badge>
        <Badge dot count={1} offset={[-6, 6]}>
          <Avatar size="large" text="DT" />
        </Badge>
        <Badge showZero count={0}>
          <Avatar size="large" text="0" />
        </Badge>
      </Space>
    </>
  );
}

export default BadgeCountAndDotDemo;
