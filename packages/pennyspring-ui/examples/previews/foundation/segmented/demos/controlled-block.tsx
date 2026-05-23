import React from 'react';
import { View } from 'react-native';
import { Segmented, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { SegmentedValue } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const segmentedControlledBlockDemoTitle = 'Controlled block';

export function SegmentedControlledBlockDemo() {
  const styles = useStyles();
  const [value, setValue] = React.useState<SegmentedValue>('week');

  return (
    <>
      <View style={styles.stack}>
        <Segmented
          block
          value={value}
          onChange={setValue}
          options={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
        <Text color="description" size="sm">
          Selected: {String(value)}
        </Text>
      </View>
    </>
  );
}

export default SegmentedControlledBlockDemo;
