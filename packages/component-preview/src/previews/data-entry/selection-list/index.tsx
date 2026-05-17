import React from 'react';
import { View } from 'react-native';
import { SelectionList } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type {
  SelectionListOption,
  SelectionListOptionGroup,
} from '@pennyspring/component';

const SELECTION_LIST_OPTIONS: SelectionListOption[] = [
  { value: 'cash', label: 'Cash', description: 'Available balance' },
  { value: 'card', label: 'Card', description: 'Primary card' },
  { value: 'saving', label: 'Saving', disabled: true },
];

const SELECTION_LIST_GROUPS: SelectionListOptionGroup[] = [
  {
    key: 'daily',
    title: 'Daily',
    options: [
      { value: 'food', label: 'Food' },
      { value: 'traffic', label: 'Traffic' },
    ],
  },
  {
    key: 'fixed',
    title: 'Fixed',
    options: [
      { value: 'rent', label: 'Rent' },
      { value: 'utility', label: 'Utility' },
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

  return (
    <PreviewScaffold>
      <PreviewSection title="Trigger">
        <View style={styles.stack}>
          <SelectionList label="Single" options={SELECTION_LIST_OPTIONS} defaultValue="cash" />
          <SelectionList label="Multiple" mode="multiple" options={SELECTION_LIST_OPTIONS} defaultValue={['cash', 'card']} />
          <SelectionList disabled label="Disabled" options={SELECTION_LIST_OPTIONS} placeholder="Not selectable" />
        </View>
      </PreviewSection>

      <PreviewSection title="Open and grouped">
        <SelectionList
          groups={SELECTION_LIST_GROUPS}
          helperText="Grouped options with search input."
          label="Grouped"
          searchable
        />
      </PreviewSection>
    </PreviewScaffold>
  );
}
