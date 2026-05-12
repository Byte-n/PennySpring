import React from 'react';
import { SideBar, Text } from '@pennyspring/component';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const SIDEBAR_ITEMS = [
  { value: 'overview', label: 'Overview' },
  { value: 'records', label: 'Records' },
  { value: 'budget', label: 'Budget' },
  { value: 'settings', label: 'Settings', disabled: true },
] as const;

export function SideBarPreview() {
  return (
    <PreviewScaffold>
      <PreviewSection title="Wrap layout">
        <SideBar
          items={[...SIDEBAR_ITEMS]}
          defaultValue="records"
          layout="wrap"
          renderContent={item => (
            <Text color="description" size="sm">
              Active panel: {String(item.value)}
            </Text>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Scroll layout and size">
        <SideBar
          items={[
            ...SIDEBAR_ITEMS,
            { value: 'assets', label: 'Assets' },
            { value: 'reports', label: 'Reports' },
            { value: 'audit', label: 'Audit' },
          ]}
          defaultValue="overview"
          layout="scroll"
          size="large"
          renderContent={item => (
            <Text color="description" size="sm">
              Current: {String(item.value)}
            </Text>
          )}
        />
      </PreviewSection>
    </PreviewScaffold>
  );
}
