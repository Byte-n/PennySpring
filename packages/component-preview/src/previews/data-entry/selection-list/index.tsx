import React from 'react';
import { View } from 'react-native';
import { SelectionList } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import { InlineValue } from '../pickerPreviewShared';
import type {
  SelectionListOption,
  SelectionListOptionGroup,
} from '@pennyspring/component';

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

export function SelectionListPreview() {
  const styles = useStyles();
  const [searchValue, setSearchValue] = React.useState('');
  const [controlledValue, setControlledValue] = React.useState<Array<string | number>>([
    'food',
    'rent',
  ]);

  return (
    <PreviewScaffold>
      <PreviewSection title="Trigger">
        <View style={styles.stack}>
          <SelectionList labelText="Single" options={SELECTION_LIST_OPTIONS} defaultValue="cash" />
          <SelectionList labelText="Multiple" mode="multiple" options={SELECTION_LIST_OPTIONS} defaultValue={['cash', 'card']} />
          <SelectionList
            displayMode="tag"
            labelText="Tag display"
            mode="multiple"
            options={SELECTION_LIST_OPTIONS}
            defaultValue={['cash', 'card']}
          />
          <SelectionList disabled labelText="Disabled" options={SELECTION_LIST_OPTIONS} placeholder="Not selectable" />
          <SelectionList readonly labelText="Readonly" options={SELECTION_LIST_OPTIONS} placeholder="Readonly trigger" />
        </View>
      </PreviewSection>

      <PreviewSection title="Search and grouped">
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
          <InlineValue label="searchValue" value={searchValue || '-'} />
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
      </PreviewSection>

      <PreviewSection title="Controlled value">
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
          <InlineValue label="Selected" value={controlledValue.join(' / ')} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
