import React from 'react';
import { View } from 'react-native';
import { Tabs } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

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

export const tabsSizeAndDisabledDemoTitle = 'Size and disabled';

export function TabsSizeAndDisabledDemo() {
  const styles = useStyles();

  return (
    <>
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
    </>
  );
}

export default TabsSizeAndDisabledDemo;
