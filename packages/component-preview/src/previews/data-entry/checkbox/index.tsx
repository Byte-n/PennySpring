import React from 'react';
import { View } from 'react-native';
import { Checkbox, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { CheckboxGroupOption, CheckboxValue } from '@pennyspring/component';

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

export function CheckboxPreview() {
  const styles = useStyles();
  const [selectedValues, setSelectedValues] = React.useState<CheckboxValue[]>([
    'daily',
  ]);

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <Checkbox defaultValue>Checked</Checkbox>
          <Checkbox>Unchecked</Checkbox>
          <Checkbox indeterminate>Indeterminate</Checkbox>
        </View>
      </PreviewSection>

      <PreviewSection title="Group">
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
      </PreviewSection>

      <PreviewSection title="Button type and state">
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
      </PreviewSection>
    </PreviewScaffold>
  );
}
