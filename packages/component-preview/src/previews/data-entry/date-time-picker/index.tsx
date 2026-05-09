import React from 'react';
import { View } from 'react-native';
import { DateTimePicker, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const BASE_DATE = new Date(2026, 4, 9, 14, 30, 20);
const MIN_DATE = new Date(2026, 0, 1, 0, 0, 0);
const MAX_DATE = new Date(2026, 11, 31, 23, 59, 59);

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

export function DateTimePickerPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Precision">
        <View style={styles.stack}>
          <DateTimePicker precision="day" defaultValue={BASE_DATE} titleText="Date">
            <TriggerContent label="Date" value="2026-05-09" />
          </DateTimePicker>
          <DateTimePicker precision="minute" defaultValue={BASE_DATE} titleText="Date and time">
            <TriggerContent label="Date time" value="2026-05-09 14:30" />
          </DateTimePicker>
          <DateTimePicker
            precision="second"
            secondStep={10}
            defaultValue={BASE_DATE}
            titleText="Second precision"
          >
            <TriggerContent label="Second step" value="2026-05-09 14:30:20" />
          </DateTimePicker>
        </View>
      </PreviewSection>

      <PreviewSection title="Range and open">
        <View style={styles.stack}>
          <DateTimePicker
            defaultOpen
            precision="month"
            min={MIN_DATE}
            max={MAX_DATE}
            defaultValue={BASE_DATE}
            titleText="Month in 2026"
          >
            <TriggerContent label="Default open" value="2026-05" />
          </DateTimePicker>
          <DateTimePicker disabled defaultValue={BASE_DATE} titleText="Disabled">
            <TriggerContent label="Disabled" value="Not selectable" />
          </DateTimePicker>
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
