import React from 'react';
import { Space, SideBar, Text } from '@pennyspring/ui';
import type { SideBarItem, SideBarValue } from '@pennyspring/ui';

const SIDEBAR_ITEMS: SideBarItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'records', label: 'Records' },
  { value: 'budget', label: 'Budget' },
  { value: 'settings', label: 'Settings', disabled: true },
];

export const sideBarControlledAndBlockDemoTitle = 'Controlled and block';

export function SideBarControlledAndBlockDemo() {
  const [value, setValue] = React.useState<SideBarValue>('records');

  return (
    <>
      <SideBar
        block
        items={SIDEBAR_ITEMS}
        layout="wrap"
        value={value}
        onChange={setValue}
        onPress={(_event, nextValue) => {
          setValue(nextValue);
        }}
        renderContent={item => (
          <Text color="description" size="sm">
            Active panel: {String(item.value)}
          </Text>
        )}
      />
      <Space align="center" size="large" wrap>
        <Text color="description" size="sm">
          Current value: {String(value)}
        </Text>
      </Space>
    </>
  );
}

export default SideBarControlledAndBlockDemo;
