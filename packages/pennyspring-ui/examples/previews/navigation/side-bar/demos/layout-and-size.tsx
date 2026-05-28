import React from 'react';
import { SideBar, Text } from '@pennyspring/ui';
import type { SideBarItem } from '@pennyspring/ui';

const SIDEBAR_ITEMS: SideBarItem[] = [
  { value: 'overview', labelText: 'Overview' },
  { value: 'records', labelText: 'Records' },
  { value: 'budget', labelText: 'Budget' },
  { value: 'settings', labelText: 'Settings', disabled: true },
];

export const sideBarLayoutAndSizeDemoTitle = 'Layout and size';

export function SideBarLayoutAndSizeDemo() {
  return (
    <>
      <SideBar
        items={[
          ...SIDEBAR_ITEMS,
          { value: 'assets', labelText: 'Assets' },
          { value: 'reports', labelText: 'Reports' },
          { value: 'audit', labelText: 'Audit' },
        ]}
        defaultValue="overview"
        layout="scroll"
        size="small"
        renderContent={item => (
          <Text color="description" size="sm">
            Scroll panel: {String(item.value)}
          </Text>
        )}
      />
    </>
  );
}

export default SideBarLayoutAndSizeDemo;
