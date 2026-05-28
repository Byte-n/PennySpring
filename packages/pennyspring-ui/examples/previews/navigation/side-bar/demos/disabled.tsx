import React from 'react';
import { SideBar, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { SideBarItem } from '@pennyspring/ui';

const SIDEBAR_ITEMS: SideBarItem[] = [
  { value: 'overview', labelText: 'Overview' },
  { value: 'records', labelText: 'Records' },
  { value: 'budget', labelText: 'Budget' },
  { value: 'settings', labelText: 'Settings', disabled: true },
];

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const sideBarDisabledDemoTitle = 'Disabled';

export function SideBarDisabledDemo() {
  const styles = useStyles();

  return (
    <>
      <SideBar
        items={SIDEBAR_ITEMS}
        defaultValue="overview"
        layout="wrap"
        disabled
        renderContent={item => (
          <Text color="description" size="sm">
            Disabled sidebar panel: {String(item.value)}
          </Text>
        )}
      />
      <Text color="description" size="sm" style={styles.status}>
        All tabs are disabled when `disabled` is enabled.
      </Text>
    </>
  );
}

export default SideBarDisabledDemo;
