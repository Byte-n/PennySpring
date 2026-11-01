import React from 'react';
import { DateTimeCalendarPicker } from './CalendarLayout';
import { DateTimeWheelPicker } from './WheelLayout';
import type {
  DateTimePickerParts,
  DateTimePickerPrecision,
  DateTimePickerProps,
} from './types';

export interface DateTimePickerCoreProps extends Omit<
  DateTimePickerProps,
  'precision'
> {
  parts: DateTimePickerParts;
  precision?: DateTimePickerPrecision;
}

/**
 * 日期时间选择器内核：按 parts 与 layout 分派到滚轮或日历布局。
 * 仅时间场景强制使用滚轮布局。
 */
export function DateTimePickerCore(props: DateTimePickerCoreProps) {
  const layout = props.parts === 'time' ? 'wheel' : (props.layout ?? 'wheel');

  if (layout === 'calendar') {
    return <DateTimeCalendarPicker {...props} />;
  }

  return <DateTimeWheelPicker {...props} />;
}
