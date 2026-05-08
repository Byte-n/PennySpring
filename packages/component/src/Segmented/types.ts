import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SegmentedValue = string | number;

export type SegmentedSize = ComponentSize;

export type SegmentedRawOption = SegmentedValue;

export interface SegmentedLabeledOption {
  value: SegmentedValue;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export type SegmentedOption = SegmentedRawOption | SegmentedLabeledOption;

export interface SegmentedStyles {
  track?: StyleProp<ViewStyle>;
  trackDisabled?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  itemSelected?: StyleProp<ViewStyle>;
  itemPressed?: StyleProp<ViewStyle>;
  itemDisabled?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  icon?: StyleProp<ViewStyle>;
  iconSelected?: StyleProp<ViewStyle>;
  iconDisabled?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelSelected?: StyleProp<TextStyle>;
  labelDisabled?: StyleProp<TextStyle>;
}

export interface SegmentedProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  options?: SegmentedOption[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  disabled?: boolean;
  block?: boolean;
  size?: SegmentedSize;
  style?: StyleProp<ViewStyle>;
  styles?: SegmentedStyles;
  onPress?: (event: GestureResponderEvent, value: SegmentedValue) => void;
}
