import React from 'react';
import { View } from 'react-native';
import { CascadePicker, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { CascadePickerOption } from '@pennyspring/component';

const CASCADE_OPTIONS: CascadePickerOption[] = [
  {
    labelText: 'Daily',
    value: 'daily',
    children: [
      {
        labelText: 'Food',
        value: 'food',
        children: [
          { labelText: 'Breakfast', value: 'breakfast' },
          { labelText: 'Dinner', value: 'dinner' },
        ],
      },
      {
        labelText: 'Traffic',
        value: 'traffic',
        children: [
          { labelText: 'Metro', value: 'metro' },
          { labelText: 'Taxi', value: 'taxi' },
        ],
      },
    ],
  },
  {
    labelText: 'Fixed',
    value: 'fixed',
    children: [
      {
        labelText: 'Home',
        value: 'home',
        children: [
          { labelText: 'Rent', value: 'rent' },
          { labelText: 'Utilities', value: 'utilities' },
        ],
      },
    ],
  },
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

export function CascadePickerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Cascade">
        <View style={styles.stack}>
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['daily', 'food', 'breakfast']}
            titleText="Category"
          >
            <TriggerContent label="Three levels" value="Daily / Food / Breakfast" />
          </CascadePicker>
          <CascadePicker
            options={CASCADE_OPTIONS}
            defaultValue={['fixed', 'home', 'rent']}
            titleText="Fixed expense"
          >
            <TriggerContent label="Default value" value="Fixed / Home / Rent" />
          </CascadePicker>
          <CascadePicker disabled options={CASCADE_OPTIONS} titleText="Disabled">
            <TriggerContent label="Disabled" value="Not selectable" />
          </CascadePicker>
        </View>
      </PreviewSection>

      <PreviewSection title="Open">
        <CascadePicker
          defaultOpen
          options={CASCADE_OPTIONS}
          defaultValue={['daily', 'traffic', 'metro']}
          titleText="Default open"
        >
          <TriggerContent label="Default open" value="Daily / Traffic / Metro" />
        </CascadePicker>
      </PreviewSection>
    </PreviewScaffold>
  );
}
