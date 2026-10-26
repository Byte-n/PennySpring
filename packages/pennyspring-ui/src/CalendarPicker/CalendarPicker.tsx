import React from 'react';
import { DateTimePickerCore } from '../DateTimePicker/DateTimePickerCore';
import { toCalendarPickerParams } from './dateValue';
import { CalendarPickerRange } from './CalendarPickerRange';
import { CalendarPickerView } from './CalendarPickerView';
import type { CalendarPickerProps } from './types';

function CalendarPickerRoot({
  precision = 'day',
  onChange,
  onOk,
  ...props
}: CalendarPickerProps) {
  // 只向外暴露年月日参数，隐藏内核携带的时间字段。
  const handleChange = onChange
    ? (value: Date) => onChange(value, toCalendarPickerParams(value))
    : undefined;
  const handleOk = onOk
    ? (value: Date) => onOk(value, toCalendarPickerParams(value))
    : undefined;

  return (
    <DateTimePickerCore
      {...props}
      layout="calendar"
      parts="date"
      precision={precision}
      onChange={handleChange}
      onOk={handleOk}
    />
  );
}

/** 输入型日历选择器，附带纯面板与范围选择能力。 */
export const CalendarPicker = Object.assign(CalendarPickerRoot, {
  View: CalendarPickerView,
  Range: CalendarPickerRange,
});
