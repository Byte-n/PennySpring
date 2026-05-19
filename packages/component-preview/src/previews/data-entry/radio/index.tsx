import React from 'react';
import { View } from 'react-native';
import { Radio, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { RadioGroupOption, RadioGroupValue } from '@pennyspring/component';

const RADIO_OPTIONS: RadioGroupOption[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month', disabled: true },
];

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function RadioPreview() {
  const styles = useStyles();
  const [value, setValue] = React.useState<RadioGroupValue>('week');

  return (
    <PreviewScaffold>
      <PreviewSection title="Basic">
        <View style={styles.stack}>
          <Radio defaultValue>Selected</Radio>
          <Radio>Unselected</Radio>
          <Radio readonly defaultValue>
            Readonly
          </Radio>
          <Radio disabled defaultValue>
            Disabled
          </Radio>
        </View>
      </PreviewSection>

      <PreviewSection title="Group">
        <View style={styles.stack}>
          <Radio.Group
            options={RADIO_OPTIONS}
            value={value}
            onChange={setValue}
          />
          <Radio.Group
            direction="vertical"
            defaultValue="day"
            options={RADIO_OPTIONS}
          />
          <Text color="description" size="sm">
            Selected: {String(value)}
          </Text>
        </View>
      </PreviewSection>

      <PreviewSection title="Button type and state">
        <View style={styles.stack}>
          <Radio displayType="button" defaultValue>
            Button
          </Radio>
          <Radio.Group
            block
            displayType="button"
            defaultValue="week"
            options={RADIO_OPTIONS}
          />
          <Radio.Group
            readonly
            defaultValue="day"
            options={RADIO_OPTIONS}
          />
          <Radio.Group
            disabled
            displayType="button"
            defaultValue="day"
            options={RADIO_OPTIONS}
          />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
