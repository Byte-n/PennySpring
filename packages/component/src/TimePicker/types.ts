import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  PickerCancelParams,
  PickerOpenChangeParams,
  PickerStyles,
} from '../Picker';

export type TimePickerPrecision = 'hour' | 'minute' | 'second';

export type TimePickerColumnType = 'hour' | 'minute' | 'second';

export interface TimePickerLabelParams {
  type: TimePickerColumnType;
  value: number;
  date: Date;
}

export interface TimePickerValueParams {
  hours: number;
  minutes: number;
  seconds: number;
  date: Date;
}

export interface TimePickerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;

  value?: Date;
  defaultValue?: Date;
  onChange?: (value: Date, params: TimePickerValueParams) => void;
  onOk?: (value: Date, params: TimePickerValueParams) => void;
  onCancel?: (params: PickerCancelParams) => void;

  precision?: TimePickerPrecision;
  minuteStep?: number;
  secondStep?: number;
  min?: Date;
  max?: Date;
  formatLabel?: (value: number, params: TimePickerLabelParams) => string;
  renderLabel?: (params: TimePickerLabelParams) => ReactNode;

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
  placeholder?: string;
  disabled?: boolean;
  okDisabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PickerStyles;
}
