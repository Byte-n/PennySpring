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

const DEFAULT_DATE = new Date(2026, 4, 16);

export function CalendarPickerReadonlyAndDisabledDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <CalendarPicker.View
        defaultValue="2026-05-16"
        readonly
        style={styles.calendarBox}
      />
      <CalendarPicker.View
        defaultValue="2026-05-16"
        disabled
        style={styles.calendarBox}
      />
      <CalendarPicker
        readonly
        defaultValue={DEFAULT_DATE}
        labelText="Readonly input"
        titleText="Readonly input"
      />
      <CalendarPicker
        disabled
        defaultValue={DEFAULT_DATE}
        labelText="Disabled input"
        titleText="Disabled input"
      />
    </View>
  );
}

export default CalendarPickerReadonlyAndDisabledDemo;
