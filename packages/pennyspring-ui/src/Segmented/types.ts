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

export type SegmentedRawOption = SegmentedValue;

export interface SegmentedLabeledOption {
  value: SegmentedValue;
  labelText?: string;
  label?: ReactNode | null;
  icon?: ReactNode;
  disabled?: boolean;
}

export type SegmentedOption = SegmentedRawOption | SegmentedLabeledOption;

export interface SegmentedStyles {
  track?: StyleProp<ViewStyle>;
  item?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  icon?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface SegmentedProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  options?: SegmentedOption[];
  value?: SegmentedValue;
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  disabled?: boolean;
  block?: boolean;
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  styles?: SegmentedStyles;
  onPress?: (event: GestureResponderEvent, value: SegmentedValue) => void;
}
