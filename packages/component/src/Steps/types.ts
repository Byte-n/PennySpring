import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type StepsSize = ComponentSize;
export type StepsStatus = 'wait' | 'process' | 'finish' | 'error';

export interface StepsItem {
  key?: string | number;
  titleText?: string;
  title?: ReactNode;
  descriptionText?: string;
  description?: ReactNode;
  status?: StepsStatus;
  disabled?: boolean;
}

export interface StepsStyles {
  item?: StyleProp<ViewStyle>;
  stepHeader?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  indicatorText?: StyleProp<TextStyle>;
  content?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  descriptionText?: StyleProp<TextStyle>;
  connector?: StyleProp<ViewStyle>;
}

export interface StepsProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  items: StepsItem[];
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  readonly?: boolean;
  size?: StepsSize;
  status?: StepsStatus;
  style?: StyleProp<ViewStyle>;
  styles?: StepsStyles;
  onPress?: (
    event: GestureResponderEvent,
    value: number,
    item: StepsItem,
  ) => void;
}
