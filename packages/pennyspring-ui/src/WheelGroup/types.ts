import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export type WheelGroupValue = string | number;

export interface WheelGroupItemData<
  TValue extends WheelGroupValue = WheelGroupValue,
  TData = unknown,
> {
  labelText?: string;
  label?: ReactNode;
  value: TValue;
  disabled?: boolean;
  data?: TData;
}

export type WheelGroupColumn<
  TItem extends WheelGroupItemData = WheelGroupItemData,
> = TItem[];

export type WheelGroupItemValue<
  TItem extends WheelGroupItemData = WheelGroupItemData,
> = TItem['value'];

export type WheelGroupFit = 'content' | 'container';

export interface WheelGroupChangeParams<
  TItem extends WheelGroupItemData = WheelGroupItemData,
> {
  columnIndex: number;
  itemIndex: number;
  item: TItem;
  items: Array<TItem | undefined>;
}

export interface WheelGroupStyles {
  root?: StyleProp<ViewStyle>;
  band?: StyleProp<ViewStyle>;
  column?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemText?: StyleProp<TextStyle>;
  empty?: StyleProp<ViewStyle>;
}

export interface WheelGroupProps<
  TItem extends WheelGroupItemData = WheelGroupItemData,
> {
  columns: Array<WheelGroupColumn<TItem>>;
  value?: Array<WheelGroupItemValue<TItem>>;
  defaultValue?: Array<WheelGroupItemValue<TItem>>;
  onChange?: (
    value: Array<WheelGroupItemValue<TItem>>,
    params: WheelGroupChangeParams<TItem>,
  ) => void;
  onActiveIndexChange?: (columnIndex: number, itemIndex: number) => void;
  onScrollStateChange?: (isScrolling: boolean) => void;
  rows?: number;
  itemHeight?: number;
  fit?: WheelGroupFit;
  height?: number;
  disabled?: boolean;
  renderLabel?: (
    item: TItem,
    columnIndex: number,
    itemIndex: number,
  ) => ReactNode;
  empty?: ReactNode;
  emptyText?: string;
  style?: StyleProp<ViewStyle>;
  styles?: WheelGroupStyles;
  testID?: string;
}
