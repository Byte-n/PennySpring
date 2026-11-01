import React from 'react';
import { View } from 'react-native';
import { CalendarPicker } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  calendarBox: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
}));

const INPUT_MONTH = new Date(2026, 4, 9);
const INPUT_RANGE: [Date, Date] = [new Date(2026, 4, 3), new Date(2026, 4, 12)];

export function CalendarPickerModesAndRangeDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <CalendarPicker.View
        mode="month"
        defaultValue="2026-05"
        style={styles.calendarBox}
      />
      <CalendarPicker.View
        mode="year"
        defaultValue="2026"
        style={styles.calendarBox}
      />
      <CalendarPicker.View.Range
        defaultValue={['2026-05-03', '2026-05-12']}
        style={styles.calendarBox}
      />
      <CalendarPicker
        precision="month"
        defaultValue={INPUT_MONTH}
        labelText="Month input"
        titleText="Month input"
      />
      <CalendarPicker.Range
        defaultValue={INPUT_RANGE}
        labelText="Range input"
        titleText="Range input"
      />
    </View>
  );
}

export default CalendarPickerModesAndRangeDemo;
