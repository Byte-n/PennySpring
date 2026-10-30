import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type {
  PickerCancelParams,
  PickerDisplayInputProps,
  PickerOpenChangeParams,
} from '../Picker';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';
import type {
  PickerPanelStyleSlots,
  PickerPopupStyleSlots,
  TriggerFieldStyles,
} from '../shares/pickerStyles';

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
  /** 加载态：两种布局都会禁用触发器；仅日历布局会以加载面板替代日历内容。 */
  loading?: boolean;
  /** 加载文案，仅日历布局使用。 */
  loadingIndicatorText?: string;
  /** 加载指示器，仅日历布局使用。 */
  loadingIndicator?: ReactNode;
  /** 空状态文案，仅滚轮布局使用。 */
  emptyText?: string;
  /** 空状态节点，仅滚轮布局使用。 */
  empty?: ReactNode;
  labelText?: string;
  label?: ReactNode;
  /** 无标签且未选择时展示的提示文本。 */
  placeholder?: string;
  status?: InputStatus;
  displayInputProps?: PickerDisplayInputProps;
  allowClear?: boolean;
  onClear?: () => void;
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

export interface DateTimePickerCalendarCellState {
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isInRange: boolean;
}

export type DateTimePickerCalendarCellStyle = (
  value: string,
  state: DateTimePickerCalendarCellState,
) => ViewStyle | undefined;

export type DateTimePickerCalendarDateTextStyle = (
  value: string,
  state: DateTimePickerCalendarCellState,
) => TextStyle | undefined;

/** 日历布局的语义槽位，不直接复用 CalendarPicker 面板的样式类型。 */
export interface DateTimePickerCalendarStyles {
  root?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  valueText?: StyleProp<TextStyle>;
  weekHeader?: StyleProp<ViewStyle>;
  weekText?: StyleProp<TextStyle>;
  grid?: StyleProp<ViewStyle>;
  cell?: StyleProp<ViewStyle> | DateTimePickerCalendarCellStyle;
  dateText?: StyleProp<TextStyle> | DateTimePickerCalendarDateTextStyle;
  mark?: StyleProp<ViewStyle>;
  footer?: StyleProp<ViewStyle>;
}

export interface DateTimePickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: TriggerFieldStyles;
  popup?: PickerPopupStyleSlots;
  panel?: PickerPanelStyleSlots;
  /** 仅日历布局生效。 */
  calendar?: DateTimePickerCalendarStyles;
  /** 仅日历布局生效。 */
  entry?: DateTimePickerEntryStyles;
}
