import type { ReactNode } from 'react';
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { InputStatus } from '../Input';
import type { FieldSlotStyles } from '../shares/pickerStyles';

export type DisplayInputDisplay = 'inline' | 'block';
export type DisplayInputOverflow = 'hidden' | 'visible';

export type DisplayInputStyles = FieldSlotStyles;

export interface DisplayInputProps {
  size?: ComponentSize;
  display?: DisplayInputDisplay;
  overflow?: DisplayInputOverflow;
  status?: InputStatus;
  labelText?: string;
  label?: ReactNode | null;
  valueText?: string;
  /** 无标签且无值时展示的提示文本。 */
  placeholder?: string;
  children?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  readonly?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: DisplayInputStyles;
}
