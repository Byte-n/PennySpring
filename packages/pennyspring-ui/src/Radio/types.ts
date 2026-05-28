import type { ReactNode } from 'react';
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type RadioDisplayType = 'default' | 'button';

export type RadioGroupValue = string | number;

export type RadioGroupDirection = 'horizontal' | 'vertical';

export interface RadioStyles {
  control?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface RadioProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  readonly?: boolean;
  children?: ReactNode;
  size?: ComponentSize;
  displayType?: RadioDisplayType;
  style?: StyleProp<ViewStyle>;
  styles?: RadioStyles;
}

export interface RadioGroupOption {
  value: RadioGroupValue;
  labelText?: string;
  label?: ReactNode | null;
  disabled?: boolean;
}

export interface RadioGroupStyles {
  option?: StyleProp<ViewStyle>;
  control?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface RadioGroupProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: RadioGroupValue;
  defaultValue?: RadioGroupValue;
  onChange?: (value: RadioGroupValue) => void;
  options?: RadioGroupOption[];
  disabled?: boolean;
  readonly?: boolean;
  displayType?: RadioDisplayType;
  size?: ComponentSize;
  block?: boolean;
  direction?: RadioGroupDirection;
  style?: StyleProp<ViewStyle>;
  styles?: RadioGroupStyles;
}
