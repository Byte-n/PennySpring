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
import type { InputStatus } from '../Input';

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
  status?: InputStatus;
  helperText?: string;
  helper?: ReactNode | null;
  errorText?: string;
  error?: ReactNode | null;
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

export interface DateTimePickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: PickerInputStyles;
  popup?: PickerPopupStyles;
  panel?: PickerPanelStyles;
  /** 仅日历布局生效。 */
  calendar?: CalendarPickerViewStyles;
  /** 仅日历布局生效。 */
  entry?: DateTimePickerEntryStyles;
}
