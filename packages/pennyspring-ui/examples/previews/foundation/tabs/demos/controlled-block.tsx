import React from 'react';
import { View } from 'react-native';
import { Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { TabsValue } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  panel: {
    padding: token.paddingSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
}));

export const tabsControlledBlockDemoTitle = 'Controlled block';

export function TabsControlledBlockDemo() {
  const styles = useStyles();
  const [period, setPeriod] = React.useState<TabsValue>('week');

  return (
    <>
      <View style={styles.stack}>
        <Tabs
          block
          value={period}
          onChange={setPeriod}
          items={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
        <Text color="description" size="sm">
          Selected: {String(period)}
        </Text>
      </View>
    </>
  );
}

export default TabsControlledBlockDemo;
