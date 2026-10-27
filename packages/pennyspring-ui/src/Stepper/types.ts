import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface StepperStyles {
  input?: StyleProp<ViewStyle>;
  inputText?: StyleProp<TextStyle>;
  button?: StyleProp<ViewStyle>;
  buttonText?: StyleProp<TextStyle>;
}

export interface StepperProps {
  size?: ComponentSize;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** 跟随数值显示的单位，例如「期」「人」。 */
  unitText?: string;
  onChange?: (value: number) => void;
  disabled?: boolean;
  readonly?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: StepperStyles;
}
