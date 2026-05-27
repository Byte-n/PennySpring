import type { ReactNode } from 'react';
import type { GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';

export type DisplayInputDisplay = 'inline' | 'block';
export type DisplayInputOverflow = 'hidden' | 'visible';

export interface DisplayInputStyles {
  label?: StyleProp<TextStyle>;
  field?: StyleProp<ViewStyle>;
  valueContainer?: StyleProp<ViewStyle>;
  value?: StyleProp<TextStyle>;
  placeholder?: StyleProp<TextStyle>;
  prefix?: StyleProp<ViewStyle>;
  suffix?: StyleProp<ViewStyle>;
  helper?: StyleProp<TextStyle>;
  error?: StyleProp<TextStyle>;
}

export interface DisplayInputProps {
  size?: ComponentSize;
  display?: DisplayInputDisplay;
  overflow?: DisplayInputOverflow;
  status?: InputStatus;
  labelText?: string;
  label?: ReactNode | null;
  placeholder?: string;
  helperText?: string;
  helper?: ReactNode | null;
  errorText?: string;
  error?: ReactNode | null;
  valueText?: string;
  children?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: DisplayInputStyles;
}
