import React from 'react';
import { Space, Badge } from '@pennyspring/ui';

export const badgeStandaloneDemoTitle = 'Standalone';

export function BadgeStandaloneDemo() {
  return (
    <>
      <Space align="center" size="large" wrap>
        <Badge count="New" color="primary" />
        <Badge count="Sync" color="success" />
        <Badge count="Warn" color="warning" />
        <Badge count="Error" color="danger" />
      </Space>
    </>
  );
}

export default BadgeStandaloneDemo;
