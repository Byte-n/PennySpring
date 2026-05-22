import React from 'react';
import { SideBar, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewRow, PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { SideBarItem, SideBarValue } from '@pennyspring/ui';

const SIDEBAR_ITEMS: SideBarItem[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'records', label: 'Records' },
  { value: 'budget', label: 'Budget' },
  { value: 'settings', label: 'Settings', disabled: true },
];

const useStyles = createUseSheetStyle(token => ({
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function SideBarPreview() {
  const styles = useStyles();
  const [value, setValue] = React.useState<SideBarValue>('records');

  return (
    <PreviewScaffold>
      <PreviewSection title="Controlled and block">
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
        <PreviewRow>
          <Text color="description" size="sm">
            Current value: {String(value)}
          </Text>
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="Layout and size">
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
      </PreviewSection>

      <PreviewSection title="Disabled">
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
