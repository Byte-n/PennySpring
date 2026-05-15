import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ButtonColor, ButtonVariant } from '../Button';

export interface FloatingActionButtonStyles {
  button?: StyleProp<ViewStyle>;
}

export interface FloatingActionButtonProps {
  label?: string;
  icon?: ReactNode;
  disabled?: boolean;
  color?: ButtonColor;
  variant?: ButtonVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  styles?: FloatingActionButtonStyles;
  testID?: string;
}
