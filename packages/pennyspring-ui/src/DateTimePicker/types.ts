import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { CalendarPickerViewStyles } from '../CalendarPicker/types';
import type {
  PickerCancelParams,
  PickerDisplayInputProps,
  PickerInputStyles,
  PickerOpenChangeParams,
  PickerPanelStyles,
  PickerPopupStyles,
} from '../Picker';
import type { ComponentSize } from '../shares/types';

export type DateTimePickerLayout = 'wheel' | 'calendar';

/** 选择器处理的时间段：日期时间、仅日期、仅时间。 */
export type DateTimePickerParts = 'datetime' | 'date' | 'time';

export type DateTimePickerPrecision =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

export type DateTimePickerDatePrecision = 'year' | 'month' | 'day';

export type DateTimePickerTimePrecision = 'hour' | 'minute' | 'second';

export type DateTimePickerColumnType =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

export interface DateTimePickerLabelParams {
  type: DateTimePickerColumnType;
  value: number;
  date: Date;
}

export interface DateTimePickerValueParams {
  date: Date;
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DateTimePickerMark {
  date: Date;
  content?: ReactNode;
}

export interface DateTimePickerProps {
  size?: ComponentSize;
  layout?: DateTimePickerLayout;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;

  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date, params: DateTimePickerValueParams) => void;
  onOk?: (value: Date, params: DateTimePickerValueParams) => void;
  onCancel?: (params: PickerCancelParams) => void;

  precision?: DateTimePickerPrecision;
  min?: Date;
  max?: Date;
  disabledDate?: (date: Date) => boolean;
  marks?: DateTimePickerMark[];
  minuteStep?: number;
  secondStep?: number;
  formatLabel?: (value: number, params: DateTimePickerLabelParams) => string;
  renderLabel?: (params: DateTimePickerLabelParams) => ReactNode;

  titleText?: string;
  title?: ReactNode;
  cancelText?: string;
  cancel?: ReactNode;
  okText?: string;
  ok?: ReactNode;
  loading?: boolean;
  loadingIndicatorText?: string;
  loadingIndicator?: ReactNode;
  emptyText?: string;
  empty?: ReactNode;
  labelText?: string;
  label?: ReactNode;
  displayInputProps?: PickerDisplayInputProps;
  readonly?: boolean;
  disabled?: boolean;
  okDisabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: DateTimePickerStyles;
}

/** 仅日期预设：屏蔽时间步长等时间专属配置。 */
export interface DateTimePickerDateProps
  extends Omit<
    DateTimePickerProps,
    'precision' | 'minuteStep' | 'secondStep'
  > {
  precision?: DateTimePickerDatePrecision;
}

/** 仅时间预设：强制滚轮布局，故屏蔽布局、日期标记与日期禁用谓词。 */
export interface DateTimePickerTimeProps
  extends Omit<
    DateTimePickerProps,
    'precision' | 'layout' | 'marks' | 'disabledDate'
  > {
  precision?: DateTimePickerTimePrecision;
}

export interface DateTimePickerEntryStyles {
  row?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  value?: StyleProp<TextStyle>;
}

export interface DateTimePickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: PickerInputStyles;
  popup?: PickerPopupStyles;
  panel?: PickerPanelStyles;
  calendar?: CalendarPickerViewStyles;
  entry?: DateTimePickerEntryStyles;
}
