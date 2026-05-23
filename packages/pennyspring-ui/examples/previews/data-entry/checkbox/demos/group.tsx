import React from 'react';
import { View } from 'react-native';
import { Checkbox, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { CheckboxGroupOption, CheckboxValue } from '@pennyspring/ui';

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

export const checkboxGroupDemoTitle = 'Group';

export function CheckboxGroupDemo() {
  const styles = useStyles();
  const [selectedValues, setSelectedValues] = React.useState<CheckboxValue[]>([
    'daily',
  ]);

  return (
    <>
      <View style={styles.stack}>
        <Checkbox.Group
          options={CHECKBOX_OPTIONS}
          value={selectedValues}
          onChange={setSelectedValues}
        />
        <Checkbox.Group
          direction="vertical"
          defaultValue={['weekly']}
          options={CHECKBOX_OPTIONS}
        />
        <Text color="description" size="sm">
          Selected: {selectedValues.join(', ') || 'none'}
        </Text>
      </View>
    </>
  );
}

export default CheckboxGroupDemo;
