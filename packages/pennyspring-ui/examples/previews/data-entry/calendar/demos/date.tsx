import React from 'react';
import { Calendar, Text } from '@pennyspring/ui';
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

export const calendarDateDemoTitle = 'Date';

export function CalendarDateDemo() {
  const styles = useStyles();

  return (
    <>
      <Calendar
        defaultValue="2026-05-07"
        marks={[
          { date: '2026-05-07', content: <Text size="sm">2</Text> },
          { date: '2026-05-12', content: <Text size="sm">1</Text> },
        ]}
        showToday
        style={styles.calendarBox}
      />
    </>
  );
}

export default CalendarDateDemo;
