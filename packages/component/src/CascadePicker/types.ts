import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  PickerCancelParams,
  PickerDisplayInputProps,
  PickerOpenChangeParams,
  PickerStyles,
  PickerValue,
} from '../Picker';

export interface CascadePickerOption<TData = unknown> {
  labelText?: string;
  label?: ReactNode;
  value: PickerValue;
  disabled?: boolean;
  children?: Array<CascadePickerOption<TData>>;
  data?: TData;
}

export interface CascadePickerChangeParams<TData = unknown> {
  item: CascadePickerOption<TData>;
  value: PickerValue;
  columnIndex: number;
  itemIndex: number;
  path: Array<CascadePickerOption<TData>>;
  items: Array<CascadePickerOption<TData> | undefined>;
}

export interface CascadePickerOkParams<TData = unknown> {
  path: Array<CascadePickerOption<TData>>;
  items: Array<CascadePickerOption<TData> | undefined>;
}

export interface CascadePickerProps<TData = unknown> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;

  options: Array<CascadePickerOption<TData>>;
  value?: PickerValue[];
  defaultValue?: PickerValue[];
  onChange?: (
    value: PickerValue[],
    params: CascadePickerChangeParams<TData>,
  ) => void;
  onOk?: (
    value: PickerValue[],
    params: CascadePickerOkParams<TData>,
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;

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
  displayInputProps?: PickerDisplayInputProps;
  disabled?: boolean;
  okDisabled?: boolean;
  children?: ReactNode;
  renderLabel?: (item: CascadePickerOption<TData>) => ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PickerStyles;
}
