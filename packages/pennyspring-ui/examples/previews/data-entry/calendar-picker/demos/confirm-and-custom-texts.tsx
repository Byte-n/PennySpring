import React from 'react';
import { View } from 'react-native';
import { CalendarPicker } from '@pennyspring/ui';
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

export function CalendarPickerConfirmAndCustomTextsDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <CalendarPicker.View
        defaultValue="2026-05-09"
        showConfirm
        previousText="上一页"
        nextText="下一页"
        todayText="回到今天"
        cancelText="取消选择"
        okText="确认日期"
        style={styles.calendarBox}
      />
      <CalendarPicker
        defaultValue={new Date(2026, 4, 9)}
        cancelText="取消选择"
        okText="确认日期"
        labelText="Custom texts"
        titleText="Custom texts"
      />
    </View>
  );
}

export default CalendarPickerConfirmAndCustomTextsDemo;
