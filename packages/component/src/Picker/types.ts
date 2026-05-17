import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { DisplayInputProps } from '../DisplayInput';

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

export type PickerChangeReason = 'select' | 'clear';

export interface PickerSelectChangeParams {
  reason: 'select';
  columnIndex: number;
  item: PickerColumnItemData;
  itemIndex: number;
  items: Array<PickerColumnItemData | undefined>;
  value: PickerValue;
}

export interface PickerClearChangeParams {
  reason: 'clear';
  items: Array<PickerColumnItemData | undefined>;
}

export type PickerChangeParams =
  | PickerSelectChangeParams
  | PickerClearChangeParams;

export interface PickerStyles {
  trigger?: StyleProp<ViewStyle>;
  popup?: PickerPopupStyles;
  panel?: PickerPanelStyles;
}

export interface PickerPopupStyles {
  popup?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
}

export interface PickerPanelStyles {
  panel?: StyleProp<ViewStyle>;
  header?: PickerHeaderStyles;
  body?: PickerBodyStyles;
  safeArea?: StyleProp<ViewStyle>;
}

export interface PickerHeaderStyles {
  cancelButton?: StyleProp<ViewStyle>;
  cancelText?: StyleProp<TextStyle>;
  titleContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  okButton?: StyleProp<ViewStyle>;
  okText?: StyleProp<TextStyle>;
}

export interface PickerBodyStyles {
  body?: StyleProp<ViewStyle>;
  view?: PickerViewStyles;
  loading?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerViewStyles {
  column?: PickerColumnStyles;
  indicator?: StyleProp<ViewStyle>;
}

export interface PickerColumnStyles {
  column?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerPopupProps {
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
  okDisabled?: boolean;
  renderLabel?: (
    item: PickerColumnItemData,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode;
  styles?: Omit<PickerStyles, 'trigger'>;
}

type PickerDisplayInputProps = Omit<
  DisplayInputProps,
  'label' | 'placeholder' | 'disabled' | 'readonly' | 'valueText'
>;

export interface PickerProps {
  size?: ComponentSize;
  columns: PickerColumn[];
  value?: PickerValue[];
  defaultValue?: PickerValue[];
  onChange?: (value: PickerValue[], params: PickerChangeParams) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;
  onOk?: (value: PickerValue[], params: PickerOkParams) => void;
  onCancel?: (params: PickerCancelParams) => void;
  label?: DisplayInputProps['label'];
  placeholder?: string;
  displayInputProps?: PickerDisplayInputProps;
  popupProps?: PickerPopupProps;
  allowClear?: boolean;
  onClear?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  style?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}
