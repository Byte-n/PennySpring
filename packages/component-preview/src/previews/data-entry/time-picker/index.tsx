import React from 'react';
import { View } from 'react-native';
import { TimePicker, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);
const MIN_TIME = new Date(2026, 4, 9, 9, 0, 0);
const MAX_TIME = new Date(2026, 4, 9, 18, 0, 0);

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

export function TimePickerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Precision">
        <View style={styles.stack}>
          <TimePicker precision="hour" defaultValue={BASE_TIME} titleText="Hour">
            <TriggerContent label="Hour" value="14:00" />
          </TimePicker>
          <TimePicker precision="minute" defaultValue={BASE_TIME} titleText="Minute">
            <TriggerContent label="Minute" value="14:30" />
          </TimePicker>
          <TimePicker
            precision="second"
            secondStep={10}
            defaultValue={BASE_TIME}
            titleText="Second"
          >
            <TriggerContent label="Second step" value="14:30:20" />
          </TimePicker>
        </View>
      </PreviewSection>

      <PreviewSection title="Range and open">
        <View style={styles.stack}>
          <TimePicker
            defaultOpen
            precision="minute"
            minuteStep={15}
            min={MIN_TIME}
            max={MAX_TIME}
            defaultValue={BASE_TIME}
            titleText="Business hours"
          >
            <TriggerContent label="Default open" value="14:30" />
          </TimePicker>
          <TimePicker disabled defaultValue={BASE_TIME} titleText="Disabled">
            <TriggerContent label="Disabled" value="Not selectable" />
          </TimePicker>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
