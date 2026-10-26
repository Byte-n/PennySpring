import React from 'react';
import { DateTimePickerCore } from './DateTimePickerCore';
import type {
  DateTimePickerDateProps,
  DateTimePickerProps,
  DateTimePickerTimeProps,
} from './types';

function DateTimePickerRoot(props: DateTimePickerProps) {
  return <DateTimePickerCore {...props} parts="datetime" />;
}

function DateTimePickerDate(props: DateTimePickerDateProps) {
  return <DateTimePickerCore {...props} parts="date" />;
}

function DateTimePickerTime(props: DateTimePickerTimeProps) {
  return <DateTimePickerCore {...props} parts="time" />;
}

/** 日期时间选择器，附带仅日期与仅时间两个预设。 */
export const DateTimePicker = Object.assign(DateTimePickerRoot, {
  Date: DateTimePickerDate,
  Time: DateTimePickerTime,
});
