import React from 'react';
import { SideBar, Text } from '@pennyspring/ui';
import type { SideBarItem } from '@pennyspring/ui';

const SIDEBAR_ITEMS: SideBarItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'records', label: 'Records' },
  { value: 'budget', label: 'Budget' },
  { value: 'settings', label: 'Settings', disabled: true },
];

export const sideBarLayoutAndSizeDemoTitle = 'Layout and size';

export function SideBarLayoutAndSizeDemo() {
  return (
    <>
      <SideBar
        items={[
          ...SIDEBAR_ITEMS,
          { value: 'assets', label: 'Assets' },
          { value: 'reports', label: 'Reports' },
          { value: 'audit', label: 'Audit' },
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
