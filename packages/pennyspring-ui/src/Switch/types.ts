import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export interface SwitchStyles {
  root?: StyleProp<ViewStyle>;
  track?: StyleProp<ViewStyle>;
  thumb?: StyleProp<ViewStyle>;
  text?: StyleProp<TextStyle>;
}

export interface SwitchProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  checkedText?: string;
  uncheckedText?: string;
  disabled?: boolean;
  readonly?: boolean;
  size?: ComponentSize;
  style?: StyleProp<ViewStyle>;
  styles?: SwitchStyles;
}
