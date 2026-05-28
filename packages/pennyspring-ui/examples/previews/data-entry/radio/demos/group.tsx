import React from 'react';
import { View } from 'react-native';
import { Radio, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { RadioGroupOption, RadioGroupValue } from '@pennyspring/ui';

const RADIO_OPTIONS: RadioGroupOption[] = [
  { labelText: 'Day', value: 'day' },
  { labelText: 'Week', value: 'week' },
  { labelText: 'Month', value: 'month', disabled: true },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const radioGroupDemoTitle = 'Group';

export function RadioGroupDemo() {
  const styles = useStyles();
  const [value, setValue] = React.useState<RadioGroupValue>('week');

  return (
    <>
      <View style={styles.stack}>
        <Radio.Group
          options={RADIO_OPTIONS}
          value={value}
          onChange={setValue}
        />
        <Radio.Group
          direction="vertical"
          defaultValue="day"
          options={RADIO_OPTIONS}
        />
        <Text color="description" size="sm">
          Selected: {String(value)}
        </Text>
      </View>
    </>
  );
}

export default RadioGroupDemo;
