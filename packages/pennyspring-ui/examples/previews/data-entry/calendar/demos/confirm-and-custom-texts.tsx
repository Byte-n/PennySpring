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

export const calendarConfirmAndCustomTextsDemoTitle =
  'Confirm and custom texts';

export function CalendarConfirmAndCustomTextsDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Calendar
          defaultValue="2026-05-09"
          showConfirm
          previousText="上一页"
          nextText="下一页"
          todayText="回到今天"
          cancelText="取消选择"
          okText="确认日期"
          style={styles.calendarBox}
        />
      </View>
    </>
  );
}

export default CalendarConfirmAndCustomTextsDemo;
