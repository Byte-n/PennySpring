import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { DisplayInputProps, DisplayInputStyles } from '../DisplayInput';

export type PickerValue = string | number;
export type PickerOpenChangeReason = 'trigger' | 'cancel' | 'mask' | 'ok';
export type PickerCancelReason = 'cancel' | 'mask';

export interface PickerColumnItemData<
  TValue extends PickerValue = PickerValue,
  TData = unknown,
> {
  labelText?: string;
  label?: ReactNode;
  value: TValue;
  disabled?: boolean;
  data?: TData;
}

export type PickerColumn<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> = TItem[];

export type PickerItemValue<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> = TItem['value'];

export interface PickerOpenChangeParams {
  reason: PickerOpenChangeReason;
}

export interface PickerCancelParams {
  reason: PickerCancelReason;
}

export interface PickerOkParams<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> {
  items: Array<TItem | undefined>;
}

export type PickerChangeReason = 'select' | 'clear';

export interface PickerSelectChangeParams<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> {
  reason: 'select';
  columnIndex: number;
  item: TItem;
  itemIndex: number;
  items: Array<TItem | undefined>;
  value: PickerItemValue<TItem>;
}

export interface PickerClearChangeParams<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> {
  reason: 'clear';
  items: Array<TItem | undefined>;
}

export type PickerChangeParams<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> =
  | PickerSelectChangeParams<TItem>
  | PickerClearChangeParams<TItem>;

export interface PickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: PickerInputStyles;
  popup?: PickerPopupStyles;
  panel?: PickerPanelStyles;
}

export interface PickerInputStyles extends DisplayInputStyles {
  root?: StyleProp<ViewStyle>;
}

export interface PickerPopupStyles {
  root?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  handle?: StyleProp<ViewStyle>;
  handleIndicator?: StyleProp<ViewStyle>;
}

export interface PickerPanelStyles {
  root?: StyleProp<ViewStyle>;
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
  root?: StyleProp<ViewStyle>;
  view?: PickerViewStyles;
  loading?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerViewStyles {
  column?: PickerColumnStyles;
  indicator?: StyleProp<ViewStyle>;
}

export interface PickerColumnStyles {
  root?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerRenderHeaderParams<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> {
  draftValue: Array<PickerItemValue<TItem>>;
  columns: Array<PickerColumn<TItem>>;
  hasDisabledFocusedItem?: boolean;
  isWheelScrolling?: boolean;
  okDisabled?: boolean;
  onCancel: () => void;
  onOk: () => void;
}

export interface PickerPopupProps<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> {
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
    item: TItem,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode;
  renderHeader?: (params: PickerRenderHeaderParams<TItem>) => ReactNode;
}

export type PickerDisplayInputProps = Omit<
  DisplayInputProps,
  'label' | 'placeholder' | 'disabled' | 'readonly' | 'valueText' | 'style' | 'styles'
>;

export interface PickerProps<
  TItem extends PickerColumnItemData = PickerColumnItemData,
> {
  size?: ComponentSize;
  columns: Array<PickerColumn<TItem>>;
  value?: Array<PickerItemValue<TItem>>;
  defaultValue?: Array<PickerItemValue<TItem>>;
  onChange?: (
    value: Array<PickerItemValue<TItem>>,
    params: PickerChangeParams<TItem>,
  ) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;
  onOk?: (
    value: Array<PickerItemValue<TItem>>,
    params: PickerOkParams<TItem>,
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;
  label?: DisplayInputProps['label'];
  placeholder?: string;
  readonly?: boolean;
  displayInputProps?: PickerDisplayInputProps;
  popupProps?: PickerPopupProps<TItem>;
  allowClear?: boolean;
  onClear?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: PickerStyles;
  children?: ReactNode;
}
