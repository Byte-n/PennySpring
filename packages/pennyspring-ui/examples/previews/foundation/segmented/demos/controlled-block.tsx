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
            { value: 'day', labelText: 'Day' },
            { value: 'week', labelText: 'Week' },
            { value: 'month', labelText: 'Month' },
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
