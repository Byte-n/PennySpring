import type { ReactNode } from 'react';
import type { GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';

export type DisplayInputDisplay = 'inline' | 'block';
export type DisplayInputTextOverflow = 'ellipsis' | 'visible';

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
  textOverflow?: DisplayInputTextOverflow;
  status?: InputStatus;
  label?: ReactNode;
  placeholder?: string;
  helperText?: ReactNode;
  errorText?: ReactNode;
  valueText?: string;
  value?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: DisplayInputStyles;
  accessibilityLabel?: string;
}
