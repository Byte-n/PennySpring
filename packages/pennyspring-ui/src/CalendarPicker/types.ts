import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  PickerCancelParams,
  PickerDisplayInputProps,
  PickerInputStyles,
  PickerOpenChangeParams,
  PickerPanelStyles,
  PickerPopupStyles,
} from '../Picker';
import type { ComponentSize } from '../shares/types';

/** 日历面板模式：按精度切换日期、月份、年份网格。 */
export type CalendarPickerViewMode = 'date' | 'month' | 'year';

export type CalendarPickerViewSize = ComponentSize;

/** 面板值统一使用 `YYYY`、`YYYY-MM`、`YYYY-MM-DD` 字符串。 */
export type CalendarPickerViewValue = string;

export type CalendarPickerViewRangeValue = [
  CalendarPickerViewValue,
  CalendarPickerViewValue,
];

export type CalendarPickerViewFormatPreset =
  | 'date'
  | 'dateSlash'
  | 'month'
  | 'monthSlash'
  | 'year'
  | 'displayDate'
  | 'displayMonth'
  | 'displayYear';

export type CalendarPickerViewFormatFunction = (
  value: CalendarPickerViewValue,
) => string;

export type CalendarPickerViewFormat =
  | CalendarPickerViewFormatPreset
  | CalendarPickerViewFormatFunction;

export interface CalendarPickerViewMark {
  date: string;
  content?: ReactNode;
}

export interface CalendarPickerViewStyles {
  root?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  valueText?: StyleProp<TextStyle>;
  weekHeader?: StyleProp<ViewStyle>;
  weekText?: StyleProp<TextStyle>;
  grid?: StyleProp<ViewStyle>;
  cell?: StyleProp<ViewStyle>;
  dateText?: StyleProp<TextStyle>;
  mark?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
}

export interface CalendarPickerViewProps {
  size?: CalendarPickerViewSize;
  mode?: CalendarPickerViewMode;
  value?: CalendarPickerViewValue;
  defaultValue?: CalendarPickerViewValue;
  onChange?: (value: CalendarPickerViewValue) => void;
  format?: CalendarPickerViewFormat;
  minDate?: CalendarPickerViewValue;
  maxDate?: CalendarPickerViewValue;
  disabledDate?: (value: CalendarPickerViewValue) => boolean;
  marks?: CalendarPickerViewMark[];
  showToday?: boolean;
  showConfirm?: boolean;
  showValue?: boolean;
  onOk?: (value: CalendarPickerViewValue) => void;
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
  styles?: CalendarPickerViewStyles;
}

export interface CalendarPickerViewRangeProps
  extends Omit<
    CalendarPickerViewProps,
    'value' | 'defaultValue' | 'onChange' | 'onOk'
  > {
  value?: CalendarPickerViewRangeValue;
  defaultValue?: CalendarPickerViewRangeValue;
  onChange?: (value: CalendarPickerViewRangeValue) => void;
  onOk?: (value: CalendarPickerViewRangeValue) => void;
}

/** 输入型日历选择器的精度，决定回传日期保留到哪一级。 */
export type CalendarPickerPrecision = 'year' | 'month' | 'day';

export interface CalendarPickerValueParams {
  date: Date;
  year: number;
  month: number;
  day: number;
}

export interface CalendarPickerMark {
  date: Date;
  content?: ReactNode;
}

export interface CalendarPickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: PickerInputStyles;
  popup?: PickerPopupStyles;
  panel?: PickerPanelStyles;
  calendar?: CalendarPickerViewStyles;
}

export interface CalendarPickerProps {
  size?: ComponentSize;
  precision?: CalendarPickerPrecision;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;
  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date, params: CalendarPickerValueParams) => void;
  onOk?: (value: Date, params: CalendarPickerValueParams) => void;
  onCancel?: (params: PickerCancelParams) => void;
  min?: Date;
  max?: Date;
  disabledDate?: (value: Date) => boolean;
  marks?: CalendarPickerMark[];
  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  labelText?: string;
  label?: ReactNode;
  displayInputProps?: PickerDisplayInputProps;
  disabled?: boolean;
  readonly?: boolean;
  okDisabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: CalendarPickerStyles;
}

export interface CalendarPickerRangeProps
  extends Omit<
    CalendarPickerProps,
    'precision' | 'value' | 'defaultValue' | 'onChange' | 'onOk'
  > {
  precision?: CalendarPickerPrecision;
  value?: [Date, Date];
  defaultValue?: [Date, Date];
  onChange?: (value: [Date, Date]) => void;
  onOk?: (value: [Date, Date]) => void;
}
