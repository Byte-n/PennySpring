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

const MIN_DATE = new Date(2026, 4, 5);
const MAX_DATE = new Date(2026, 4, 20);
const DEFAULT_DATE = new Date(2026, 4, 10);

export function CalendarPickerLimitsAndDateControlDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <CalendarPicker.View
        defaultValue="2026-05-10"
        minDate="2026-05-05"
        maxDate="2026-05-20"
        disabledDate={value =>
          value === '2026-05-12' || value === '2026-05-18'
        }
        style={styles.calendarBox}
      />
      <CalendarPicker
        defaultValue={DEFAULT_DATE}
        min={MIN_DATE}
        max={MAX_DATE}
        disabledDate={date =>
          date.getDate() === 12 || date.getDate() === 18
        }
        labelText="Limited dates"
        titleText="Limited dates"
      />
    </View>
  );
}

export default CalendarPickerLimitsAndDateControlDemo;
