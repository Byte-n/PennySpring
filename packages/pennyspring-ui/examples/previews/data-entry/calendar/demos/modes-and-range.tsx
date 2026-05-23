import React from 'react';
import { View } from 'react-native';
import { Calendar } from '@pennyspring/ui';
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

export const calendarModesAndRangeDemoTitle = 'Modes and range';

export function CalendarModesAndRangeDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Calendar
          mode="month"
          defaultValue="2026-05"
          style={styles.calendarBox}
        />
        <Calendar mode="year" defaultValue="2026" style={styles.calendarBox} />
        <Calendar.Range
          defaultValue={['2026-05-03', '2026-05-12']}
          style={styles.calendarBox}
        />
      </View>
    </>
  );
}

export default CalendarModesAndRangeDemo;
