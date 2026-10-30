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
import type { SemanticPresetColor } from '../shares/color';

export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link' | 'danger';

export type ButtonSemanticColor = 'default' | 'primary' | 'danger';
export type ButtonColor = SemanticPresetColor<ButtonSemanticColor>;

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
  ghost?: boolean;
  shape?: ButtonShape;
  size?: ComponentSize;
  icon?: IconName | IconComponent;
  /** 图标的非样式配置；尺寸与颜色由 Button 按 size / type 统一映射。 */
  iconProps?: Omit<IconProps, 'icon' | 'style'>;
  iconPlacement?: ButtonIconPlacement;
  loading?: boolean | ButtonLoadingConfig;
  disabled?: boolean;
  block?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  styles?: ButtonStyles;
}
