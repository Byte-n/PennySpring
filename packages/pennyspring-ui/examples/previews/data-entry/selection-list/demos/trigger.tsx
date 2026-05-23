import React from 'react';
import { View } from 'react-native';
import { SelectionList } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { SelectionListOption } from '@pennyspring/ui';

const SELECTION_LIST_OPTIONS: SelectionListOption[] = [
  { value: 'cash', labelText: 'Cash', descriptionText: 'Available balance' },
  { value: 'card', labelText: 'Card', descriptionText: 'Primary card' },
  { value: 'saving', labelText: 'Saving', disabled: true },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const selectionListTriggerDemoTitle = 'Trigger';

export function SelectionListTriggerDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <SelectionList
          labelText="Single"
          options={SELECTION_LIST_OPTIONS}
          defaultValue="cash"
        />
        <SelectionList
          labelText="Multiple"
          mode="multiple"
          options={SELECTION_LIST_OPTIONS}
          defaultValue={['cash', 'card']}
        />
        <SelectionList
          displayMode="tag"
          labelText="Tag display"
          mode="multiple"
          options={SELECTION_LIST_OPTIONS}
          defaultValue={['cash', 'card']}
        />
        <SelectionList
          disabled
          labelText="Disabled"
          options={SELECTION_LIST_OPTIONS}
          placeholder="Not selectable"
        />
        <SelectionList
          readonly
          labelText="Readonly"
          options={SELECTION_LIST_OPTIONS}
          placeholder="Readonly trigger"
        />
      </View>
    </>
  );
}

export default SelectionListTriggerDemo;
