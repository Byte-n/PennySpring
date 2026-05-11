import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type StepperSize = ComponentSize;

export interface StepperStyles {
  input?: StyleProp<ViewStyle>;
  inputText?: StyleProp<TextStyle>;
  button?: StyleProp<ViewStyle>;
  buttonText?: StyleProp<TextStyle>;
}

export interface StepperProps {
  size?: StepperSize;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  readonly?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: StepperStyles;
}
