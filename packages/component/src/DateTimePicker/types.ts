import type { ReactNode } from 'react';
import type {
  PickerCancelParams,
  PickerOpenChangeParams,
  PickerStyles,
} from '../Picker';

export type DateTimePickerPrecision =
  | 'year'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second';

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

export interface DateTimePickerProps {
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
  disabled?: boolean;
  readOnly?: boolean;
  okDisabled?: boolean;
  children?: ReactNode;
  styles?: PickerStyles;
}
