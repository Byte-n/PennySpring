import React from 'react';
import { View } from 'react-native';
import { Radio } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { RadioGroupOption } from '@pennyspring/ui';

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

export const radioButtonTypeAndStateDemoTitle = 'Button type and state';

export function RadioButtonTypeAndStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Radio displayType="button" defaultValue>
          Button
        </Radio>
        <Radio.Group
          block
          displayType="button"
          defaultValue="week"
          options={RADIO_OPTIONS}
        />
        <Radio.Group readonly defaultValue="day" options={RADIO_OPTIONS} />
        <Radio.Group
          disabled
          displayType="button"
          defaultValue="day"
          options={RADIO_OPTIONS}
        />
      </View>
    </>
  );
}

export default RadioButtonTypeAndStateDemo;
