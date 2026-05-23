import React from 'react';
import { View } from 'react-native';
import { Checkbox } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { CheckboxGroupOption } from '@pennyspring/ui';

const CHECKBOX_OPTIONS: CheckboxGroupOption[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly', disabled: true },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const checkboxButtonTypeAndStateDemoTitle = 'Button type and state';

export function CheckboxButtonTypeAndStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Checkbox displayType="button" defaultValue>
          Button
        </Checkbox>
        <Checkbox.Group
          block
          displayType="button"
          defaultValue={['daily']}
          options={CHECKBOX_OPTIONS}
        />
        <Checkbox disabled defaultValue>
          Disabled
        </Checkbox>
        <Checkbox readonly defaultValue>
          Readonly
        </Checkbox>
        <Checkbox.Group
          readonly
          defaultValue={['daily']}
          options={CHECKBOX_OPTIONS}
        />
        <Checkbox.Group
          disabled
          defaultValue={['weekly']}
          options={CHECKBOX_OPTIONS}
        />
      </View>
    </>
  );
}

export default CheckboxButtonTypeAndStateDemo;
