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

export const calendarLimitsAndDateControlDemoTitle = 'Limits and date control';

export function CalendarLimitsAndDateControlDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Calendar
          defaultValue="2026-05-10"
          minDate="2026-05-05"
          maxDate="2026-05-20"
          disabledDate={value =>
            value === '2026-05-12' || value === '2026-05-18'
          }
          style={styles.calendarBox}
        />
      </View>
    </>
  );
}

export default CalendarLimitsAndDateControlDemo;
