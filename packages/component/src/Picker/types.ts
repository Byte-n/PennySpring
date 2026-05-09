import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type PickerSize = ComponentSize;
export type PickerValue = string | number;
export type PickerOpenChangeReason = 'trigger' | 'cancel' | 'mask' | 'ok';
export type PickerCancelReason = 'cancel' | 'mask';

export interface PickerColumnItemData {
  labelText?: string;
  label?: ReactNode;
  value: PickerValue;
  disabled?: boolean;
}

export type PickerColumn = PickerColumnItemData[];

export interface PickerOpenChangeParams {
  reason: PickerOpenChangeReason;
}

export interface PickerCancelParams {
  reason: PickerCancelReason;
}

export interface PickerOkParams {
  items: Array<PickerColumnItemData | undefined>;
}

export interface PickerChangeParams {
  columnIndex: number;
  item: PickerColumnItemData;
  itemIndex: number;
  items: Array<PickerColumnItemData | undefined>;
  value: PickerValue;
}

export interface PickerStyles {
  trigger?: StyleProp<ViewStyle>;
  popup?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
  panel?: StyleProp<ViewStyle>;
  header?: StyleProp<ViewStyle>;
  cancelButton?: StyleProp<ViewStyle>;
  cancelText?: StyleProp<TextStyle>;
  titleContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  okButton?: StyleProp<ViewStyle>;
  okText?: StyleProp<TextStyle>;
  body?: StyleProp<ViewStyle>;
  view?: StyleProp<ViewStyle>;
  column?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  selectedItem?: StyleProp<ViewStyle>;
  selectedItemText?: StyleProp<TextStyle>;
  disabledItem?: StyleProp<ViewStyle>;
  disabledItemText?: StyleProp<TextStyle>;
  indicator?: StyleProp<ViewStyle>;
  loading?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
  safeArea?: StyleProp<ViewStyle>;
}

export interface PickerProps {
  size?: PickerSize;
  columns: PickerColumn[];
  value?: PickerValue[];
  defaultValue?: PickerValue[];
  onChange?: (value: PickerValue[], params: PickerChangeParams) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;
  onOk?: (value: PickerValue[], params: PickerOkParams) => void;
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
  disabled?: boolean;
  readOnly?: boolean;
  okDisabled?: boolean;
  renderLabel?: (
    item: PickerColumnItemData,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PickerStyles;
  children?: ReactNode;
}
