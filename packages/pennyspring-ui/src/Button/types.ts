import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { IconComponent, IconName, IconProps } from '../Icon';

export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';

export type ButtonColor =
  | 'default'
  | 'primary'
  | 'danger'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold';

export type ButtonVariant =
  | 'solid'
  | 'outlined'
  | 'dashed'
  | 'filled'
  | 'text'
  | 'link';

export type ButtonShape = 'default' | 'round' | 'circle';

export type ButtonIconPlacement = 'start' | 'end';

export interface ButtonLoadingConfig {
  delay?: number;
  icon?: ReactNode;
}

export interface ButtonStyles {
  icon?: StyleProp<ViewStyle>;
  content?: StyleProp<TextStyle>;
}

export interface ButtonProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled'> {
  children?: ReactNode;
  type?: ButtonType;
  color?: ButtonColor;
  variant?: ButtonVariant;
  danger?: boolean;
  ghost?: boolean;
  shape?: ButtonShape;
  size?: ComponentSize;
  icon?: IconName | IconComponent;
  iconProps?: Omit<IconProps, 'icon'>;
  iconPlacement?: ButtonIconPlacement;
  loading?: boolean | ButtonLoadingConfig;
  disabled?: boolean;
  block?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: ButtonStyles;
}
