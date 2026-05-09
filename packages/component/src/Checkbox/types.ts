import type { ReactNode } from 'react';
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type CheckboxSize = ComponentSize;

export type CheckboxDisplayType = 'default' | 'button';

export type CheckboxValue = string | number;

export interface CheckboxStyles {
  indicator?: StyleProp<ViewStyle>;
  mark?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface CheckboxProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  readonly?: boolean;
  indeterminate?: boolean;
  children?: ReactNode;
  size?: CheckboxSize;
  displayType?: CheckboxDisplayType;
  style?: StyleProp<ViewStyle>;
  styles?: CheckboxStyles;
}

export interface CheckboxGroupOption {
  value: CheckboxValue;
  label?: ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupStyles {
  option?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  mark?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface CheckboxGroupProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: CheckboxValue[];
  defaultValue?: CheckboxValue[];
  onChange?: (value: CheckboxValue[]) => void;
  options?: CheckboxGroupOption[];
  disabled?: boolean;
  readonly?: boolean;
  displayType?: CheckboxDisplayType;
  size?: CheckboxSize;
  block?: boolean;
  direction?: 'horizontal' | 'vertical';
  style?: StyleProp<ViewStyle>;
  styles?: CheckboxGroupStyles;
}
