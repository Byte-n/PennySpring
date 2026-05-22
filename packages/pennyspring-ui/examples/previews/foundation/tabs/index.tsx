import React from 'react';
import { View } from 'react-native';
import { Tabs, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
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

export function TabsPreview() {
  const styles = useStyles();
  const [period, setPeriod] = React.useState<TabsValue>('week');

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <Tabs
            defaultValue="overview"
            items={[
              { value: 'overview', label: 'Overview' },
              { value: 'records', label: 'Records' },
              { value: 'trend', label: 'Trend' },
            ]}
            renderContent={item => (
              <View style={styles.panel}>
                <Text color="description" size="sm">
                  Current tab: {String(item.value)}
                </Text>
              </View>
            )}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Size and disabled">
        <View style={styles.stack}>
          <Tabs
            size="small"
            defaultValue="day"
            items={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <Tabs
            size="large"
            defaultValue="month"
            items={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <Tabs
            defaultValue="cash"
            items={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card', disabled: true },
              { value: 'saving', label: 'Saving' },
            ]}
          />
          <Tabs
            disabled
            defaultValue="disabled"
            items={[
              { value: 'disabled', label: 'Disabled' },
              { value: 'state', label: 'State' },
            ]}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Controlled block">
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
