import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../../shares/types';
import type {
  PickerCancelParams,
  PickerDisplayInputProps,
  PickerInputStyles,
  PickerOpenChangeParams,
  PickerValue,
} from '../types';

export type PickerCascaderTabKey = string | number;

export type PickerCascaderValue<
  TTabKey extends PickerCascaderTabKey = string,
> = Record<TTabKey, PickerValue[]>;

export interface PickerCascaderOption<TData = unknown> {
  labelText?: string;
  label?: ReactNode;
  value: PickerValue;
  disabled?: boolean;
  children?: Array<PickerCascaderOption<TData>>;
  data?: TData;
}

export interface PickerCascaderTab<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabKey: TTabKey;
  labelText?: string;
  label?: ReactNode;
  options: Array<PickerCascaderOption<TData>>;
  disabled?: boolean;
}

export interface PickerCascaderChangeParams<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabKey: TTabKey;
  tabIndex: number;
  tab: PickerCascaderTab<TData, TTabKey>;
  item: PickerCascaderOption<TData>;
  value: PickerValue;
  columnIndex: number;
  itemIndex: number;
  path: Array<PickerCascaderOption<TData>>;
  items: Array<PickerCascaderOption<TData> | undefined>;
}

export interface PickerCascaderOkParams<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  tabKey: TTabKey;
  tabIndex: number;
  tab: PickerCascaderTab<TData, TTabKey>;
  path: Array<PickerCascaderOption<TData>>;
  items: Array<PickerCascaderOption<TData> | undefined>;
}

export interface PickerCascaderTabsStyles {
  tabList?: StyleProp<ViewStyle>;
  tab?: StyleProp<ViewStyle>;
  tabActive?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelActive?: StyleProp<TextStyle>;
}

export interface PickerCascaderPopupStyles {
  root?: StyleProp<ViewStyle>;
  mask?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  handle?: StyleProp<ViewStyle>;
  handleIndicator?: StyleProp<ViewStyle>;
}

export interface PickerCascaderHeaderStyles {
  cancelButton?: StyleProp<ViewStyle>;
  cancelText?: StyleProp<TextStyle>;
  titleContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  okButton?: StyleProp<ViewStyle>;
  okText?: StyleProp<TextStyle>;
}

export interface PickerCascaderColumnStyles {
  root?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerCascaderViewStyles {
  column?: PickerCascaderColumnStyles;
  indicator?: StyleProp<ViewStyle>;
}

export interface PickerCascaderBodyStyles {
  root?: StyleProp<ViewStyle>;
  view?: PickerCascaderViewStyles;
  loading?: StyleProp<ViewStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface PickerCascaderPanelStyles {
  root?: StyleProp<ViewStyle>;
  header?: PickerCascaderHeaderStyles;
  body?: PickerCascaderBodyStyles;
  safeArea?: StyleProp<ViewStyle>;
}

export interface PickerCascaderStyles {
  trigger?: StyleProp<ViewStyle>;
  input?: PickerInputStyles;
  popup?: PickerCascaderPopupStyles;
  panel?: PickerCascaderPanelStyles;
  tabs?: PickerCascaderTabsStyles;
}

export interface PickerCascaderProps<
  TData = unknown,
  TTabKey extends PickerCascaderTabKey = string,
> {
  size?: ComponentSize;
  tabs: Array<PickerCascaderTab<TData, TTabKey>>;

  value?: PickerCascaderValue<TTabKey>;
  defaultValue?: PickerCascaderValue<TTabKey>;
  onChange?: (
    value: PickerCascaderValue<TTabKey>,
    params: PickerCascaderChangeParams<TData, TTabKey>,
  ) => void;
  onOk?: (
    value: PickerCascaderValue<TTabKey>,
    params: PickerCascaderOkParams<TData, TTabKey>,
  ) => void;
  onCancel?: (params: PickerCancelParams) => void;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, params: PickerOpenChangeParams) => void;
  okDisabled?: boolean;

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
  renderLabel?: (option: PickerCascaderOption<TData>) => ReactNode;

  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: PickerCascaderStyles;
}
