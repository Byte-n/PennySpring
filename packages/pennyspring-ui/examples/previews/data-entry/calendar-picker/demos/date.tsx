import React from 'react';
import { View } from 'react-native';
import { CalendarPicker, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

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

const INPUT_DATE = new Date(2026, 4, 7);

export function CalendarPickerDateDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <CalendarPicker.View
        defaultValue="2026-05-07"
        marks={[
          { date: '2026-05-07', content: <Text size="sm">2</Text> },
          { date: '2026-05-12' },
        ]}
        showToday
        style={styles.calendarBox}
      />
      <CalendarPicker
        defaultValue={INPUT_DATE}
        labelText="Select date"
        marks={[{ date: INPUT_DATE, content: <Text size="sm">2</Text> }]}
        titleText="Input date"
      />
    </View>
  );
}

export default CalendarPickerDateDemo;
