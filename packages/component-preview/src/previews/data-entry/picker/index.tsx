import React from 'react';
import { View } from 'react-native';
import { Picker, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { PickerColumn } from '@pennyspring/component';

const ACCOUNT_COLUMN: PickerColumn = [
  { labelText: 'Cash', value: 'cash' },
  { labelText: 'Primary card', value: 'card' },
  { labelText: 'Savings', value: 'saving', disabled: true },
];

const CATEGORY_COLUMN: PickerColumn = [
  { labelText: 'Food', value: 'food' },
  { labelText: 'Traffic', value: 'traffic' },
  { labelText: 'Shopping', value: 'shopping' },
];

const MONTH_COLUMN: PickerColumn = [
  { labelText: 'May', value: 'may' },
  { labelText: 'June', value: 'june' },
  { labelText: 'July', value: 'july' },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  triggerContent: {
    gap: token.marginXXS,
  },
}));

function TriggerContent({ label, value }: { label: string; value: string }) {
  const styles = useStyles();

  return (
    <View style={styles.triggerContent}>
      <Text color="description" size="sm">{label}</Text>
      <Text color="heading" weight="strong">{value}</Text>
    </View>
  );
}

export function PickerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Trigger">
        <View style={styles.stack}>
          <Picker columns={[ACCOUNT_COLUMN]} defaultValue={['cash']} titleText="Account">
            <TriggerContent label="Single column" value="Cash" />
          </Picker>
          <Picker
            columns={[MONTH_COLUMN, CATEGORY_COLUMN]}
            defaultValue={['may', 'food']}
            titleText="Month and category"
          >
            <TriggerContent label="Multiple columns" value="May / Food" />
          </Picker>
          <Picker disabled columns={[ACCOUNT_COLUMN]} titleText="Disabled">
            <TriggerContent label="Disabled" value="Not selectable" />
          </Picker>
        </View>
      </PreviewSection>

      <PreviewSection title="Open and state">
        <View style={styles.stack}>
          <Picker
            defaultOpen
            columns={[ACCOUNT_COLUMN, CATEGORY_COLUMN]}
            defaultValue={['card', 'traffic']}
            titleText="Default open"
          >
            <TriggerContent label="Default open" value="Card / Traffic" />
          </Picker>
          <Picker
            columns={[[]]}
            emptyText="No options"
            titleText="Empty"
          >
            <TriggerContent label="Empty state" value="No options" />
          </Picker>
        </View>
      </PreviewSection>

      <PreviewSection title="Size">
        <View style={styles.stack}>
          <Picker size="small" columns={[ACCOUNT_COLUMN]} defaultValue={['cash']} titleText="Small">
            <TriggerContent label="Small" value="Cash" />
          </Picker>
          <Picker size="large" columns={[ACCOUNT_COLUMN]} defaultValue={['card']} titleText="Large">
            <TriggerContent label="Large" value="Primary card" />
          </Picker>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
