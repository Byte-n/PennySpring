import React from 'react';
import { View } from 'react-native';
import { SelectionList, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type {
  SelectionListOption,
  SelectionListOptionGroup,
} from '@pennyspring/ui';

const SELECTION_LIST_OPTIONS: SelectionListOption[] = [
  { value: 'cash', labelText: 'Cash', descriptionText: 'Available balance' },
  { value: 'card', labelText: 'Card', descriptionText: 'Primary card' },
  { value: 'saving', labelText: 'Saving', disabled: true },
];

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

export const selectionListSearchAndGroupedDemoTitle = 'Search and grouped';

export function SelectionListSearchAndGroupedDemo() {
  const styles = useStyles();
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <>
      <View style={styles.stack}>
        <SelectionList
          groups={SELECTION_LIST_GROUPS}
          helperText="Grouped options with search input."
          labelText="Grouped searchable"
          searchable
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          texts={{
            headerText: 'Select categories',
            closeText: 'Close',
            confirmText: 'Apply',
            searchPlaceholder: 'Search categories',
            loadingText: 'Loading options',
            emptyText: 'No matching option',
          }}
        />
        <Text color="description" size="sm">
          searchValue: {searchValue || '-'}
        </Text>
        <SelectionList
          groups={SELECTION_LIST_GROUPS}
          labelText="Status warning"
          status="warning"
          texts={{ headerText: 'Warning status', confirmText: 'Confirm' }}
        />
        <SelectionList
          groups={SELECTION_LIST_GROUPS}
          labelText="Status error"
          status="error"
          errorText="Please select at least one category"
        />
        <SelectionList
          labelText="Loading"
          options={SELECTION_LIST_OPTIONS}
          loading
          texts={{ headerText: 'Loading', loadingText: 'Loading choices' }}
        />
        <SelectionList
          labelText="Empty"
          options={[]}
          texts={{ headerText: 'Empty', emptyText: 'No options available' }}
        />
      </View>
    </>
  );
}

export default SelectionListSearchAndGroupedDemo;
