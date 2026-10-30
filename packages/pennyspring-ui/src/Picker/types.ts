import type { ReactNode } from 'react';
import type {
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';
import type { DisplayInputProps } from '../DisplayInput';
import type {
  PickerDisplayInputProps,
  PickerInputStyles,
} from '../_internal/PickerTrigger';

export type {
  PickerDisplayInputProps,
  PickerInputStyles,
} from '../_internal/PickerTrigger';

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
  header: ReactNode;
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
  renderHeader?: ((params: PickerRenderHeaderParams<TItem>) => ReactNode) | null;
}

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
  formatValueText?: (
    value: Array<PickerItemValue<TItem>>,
    params: PickerOkParams<TItem>,
  ) => string | undefined;
  labelText?: string;
  label?: DisplayInputProps['label'];
  status?: InputStatus;
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
