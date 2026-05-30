import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type {
  PickerCancelParams,
  PickerDisplayInputProps,
  PickerInputStyles,
  PickerOpenChangeParams,
  PickerPanelStyles,
  PickerPopupStyles,
  PickerValue,
} from '../Picker';

export type CascadePickerTabKey = string | number;

export interface CascadePickerStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: PickerInputStyles;
  popup?: PickerPopupStyles;
  panel?: PickerPanelStyles;
  tabs?: StyleProp<ViewStyle>;
}

export interface CascadePickerOption<TData = unknown> {
  labelText?: string;
  label?: ReactNode;
  value: PickerValue;
  disabled?: boolean;
  children?: Array<CascadePickerOption<TData>>;
  data?: TData;
}

export interface CascadePickerTab<TData = unknown, TTabKey extends CascadePickerTabKey = string> {
  tabKey: TTabKey;
  labelText?: string;
  label?: ReactNode;
  options: Array<CascadePickerOption<TData>>;
  disabled?: boolean;
}

export type CascadePickerValue<TTabKey extends CascadePickerTabKey = string> = Record<
  TTabKey,
  PickerValue[]
>;

export interface CascadePickerChangeParams<
  TData = unknown,
  TTabKey extends CascadePickerTabKey = string,
> {
  tabKey: TTabKey;
  tabIndex: number;
  tab: CascadePickerTab<TData, TTabKey>;
  item: CascadePickerOption<TData>;
  value: PickerValue;
  columnIndex: number;
  itemIndex: number;
  path: Array<CascadePickerOption<TData>>;
  items: Array<CascadePickerOption<TData> | undefined>;
}

export interface CascadePickerOkParams<
  TData = unknown,
  TTabKey extends CascadePickerTabKey = string,
> {
  tabKey: TTabKey;
  tabIndex: number;
  tab: CascadePickerTab<TData, TTabKey>;
  path: Array<CascadePickerOption<TData>>;
  items: Array<CascadePickerOption<TData> | undefined>;
}

export interface CascadePickerProps<
  TData = unknown,
  TTabKey extends CascadePickerTabKey = string,
> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;

  tabs: Array<CascadePickerTab<TData, TTabKey>>;
  value?: CascadePickerValue<TTabKey>;
  defaultValue?: CascadePickerValue<TTabKey>;
  onChange?: (
    value: CascadePickerValue<TTabKey>,
    params: CascadePickerChangeParams<TData, TTabKey>,
  ) => void;
  onOk?: (
    value: CascadePickerValue<TTabKey>,
    params: CascadePickerOkParams<TData, TTabKey>,
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
  labelText?: string;
  label?: ReactNode;
  displayInputProps?: PickerDisplayInputProps;
  readonly?: boolean;
  disabled?: boolean;
  okDisabled?: boolean;
  children?: ReactNode;
  renderLabel?: (item: CascadePickerOption<TData>) => ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: CascadePickerStyles;
}
