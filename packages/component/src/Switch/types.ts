import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SwitchSize = ComponentSize;

export interface SwitchStyles {
  track?: StyleProp<ViewStyle>;
  thumb?: StyleProp<ViewStyle>;
}

export interface SwitchProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  readonly?: boolean;
  size?: SwitchSize;
  style?: StyleProp<ViewStyle>;
  styles?: SwitchStyles;
}
