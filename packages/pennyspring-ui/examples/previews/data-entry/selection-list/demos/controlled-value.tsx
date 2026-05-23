import React from 'react';
import { View } from 'react-native';
import { SelectionList, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { SelectionListOptionGroup } from '@pennyspring/ui';

const SELECTION_LIST_GROUPS: SelectionListOptionGroup[] = [
  {
    key: 'daily',
    titleText: 'Daily',
    options: [
      { value: 'food', labelText: 'Food' },
      { value: 'traffic', labelText: 'Traffic' },
    ],
  },
  {
    key: 'fixed',
    titleText: 'Fixed',
    options: [
      { value: 'rent', labelText: 'Rent' },
      { value: 'utility', labelText: 'Utility' },
    ],
  },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export const selectionListControlledValueDemoTitle = 'Controlled value';

export function SelectionListControlledValueDemo() {
  const styles = useStyles();
  const [controlledValue, setControlledValue] = React.useState<
    Array<string | number>
  >(['food', 'rent']);

  return (
    <>
      <View style={styles.stack}>
        <SelectionList
          displayMode="tag"
          labelText="Controlled multiple"
          mode="multiple"
          groups={SELECTION_LIST_GROUPS}
          searchable
          value={controlledValue}
          onChange={value => {
            setControlledValue(Array.isArray(value) ? value : [value]);
          }}
        />
        <Text color="description" size="sm">
          Selected: {controlledValue.join(' / ')}
        </Text>
      </View>
    </>
  );
}

export default SelectionListControlledValueDemo;
