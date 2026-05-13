import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type CalendarSize = ComponentSize;
export type CalendarMode = 'date' | 'month' | 'year';
export type CalendarDateValue = string;
export type CalendarMonthValue = string;
export type CalendarYearValue = string;
export type CalendarValue =
  | CalendarDateValue
  | CalendarMonthValue
  | CalendarYearValue;
export type CalendarRangeValue = [CalendarValue, CalendarValue];
export type CalendarFormatPreset =
  | 'date'
  | 'dateSlash'
  | 'month'
  | 'monthSlash'
  | 'year'
  | 'displayDate'
  | 'displayMonth'
  | 'displayYear';
export type CalendarFormatFunction = (value: CalendarValue) => string;
export type CalendarFormat = CalendarFormatPreset | CalendarFormatFunction;

export interface CalendarDateMark {
  date: CalendarDateValue;
  content?: ReactNode;
}

export interface CalendarStyles {
  header?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  weekHeader?: StyleProp<ViewStyle>;
  weekText?: StyleProp<TextStyle>;
  grid?: StyleProp<ViewStyle>;
  cell?: StyleProp<ViewStyle>;
  dateText?: StyleProp<TextStyle>;
  mark?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
}

export interface CalendarProps {
  size?: CalendarSize;
  mode?: CalendarMode;
  value?: CalendarValue;
  defaultValue?: CalendarValue;
  onChange?: (value: CalendarValue) => void;
  format?: CalendarFormat;
  minDate?: CalendarValue;
  maxDate?: CalendarValue;
  disabledDate?: (value: CalendarValue) => boolean;
  marks?: CalendarDateMark[];
  showToday?: boolean;
  showConfirm?: boolean;
  onOk?: (value: CalendarValue) => void;
  onCancel?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  previousText?: string;
  previous?: ReactNode;
  nextText?: string;
  next?: ReactNode;
  todayText?: string;
  today?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: CalendarStyles;
}

export interface CalendarRangeProps
  extends Omit<CalendarProps, 'value' | 'defaultValue' | 'onChange' | 'onOk'> {
  value?: CalendarRangeValue;
  defaultValue?: CalendarRangeValue;
  onChange?: (value: CalendarRangeValue) => void;
  onOk?: (value: CalendarRangeValue) => void;
}
