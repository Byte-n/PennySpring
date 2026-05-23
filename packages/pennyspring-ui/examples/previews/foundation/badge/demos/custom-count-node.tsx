import React from 'react';
import { Avatar, Badge, Text } from '@pennyspring/ui';

export const badgeCustomCountNodeDemoTitle = 'Custom count node';

export function BadgeCustomCountNodeDemo() {
  return (
    <>
      <Badge
        color="magenta"
        count={
          <Text color="lightSolid" size="sm" weight="strong">
            VIP
          </Text>
        }
      >
        <Avatar size="large" text="MB" />
      </Badge>
    </>
  );
}

export default BadgeCustomCountNodeDemo;
