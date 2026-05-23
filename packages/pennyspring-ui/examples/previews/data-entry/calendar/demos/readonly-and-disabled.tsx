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

export const calendarReadonlyAndDisabledDemoTitle = 'Readonly and disabled';

export function CalendarReadonlyAndDisabledDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Calendar
          defaultValue="2026-05-16"
          readonly
          style={styles.calendarBox}
        />
        <Calendar
          defaultValue="2026-05-16"
          disabled
          style={styles.calendarBox}
        />
      </View>
    </>
  );
}

export default CalendarReadonlyAndDisabledDemo;
