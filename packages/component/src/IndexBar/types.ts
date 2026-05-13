import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type IndexBarValue = string | number;

export interface IndexBarPanelProps {
  index: IndexBarValue;
  titleText?: string;
  title?: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export interface IndexBarStyles {
  content?: StyleProp<ViewStyle>;
  panel?: StyleProp<ViewStyle>;
  panelTitleContainer?: StyleProp<ViewStyle>;
  panelTitleText?: StyleProp<TextStyle>;
  sidebar?: StyleProp<ViewStyle>;
  indexItem?: StyleProp<ViewStyle>;
  indexItemPressed?: StyleProp<ViewStyle>;
  indexItemActive?: StyleProp<ViewStyle>;
  indexItemDisabled?: StyleProp<ViewStyle>;
  indexText?: StyleProp<TextStyle>;
  indexTextActive?: StyleProp<TextStyle>;
  indexTextDisabled?: StyleProp<TextStyle>;
}

export interface IndexBarProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  value?: IndexBarValue;
  defaultValue?: IndexBarValue;
  onChange?: (value: IndexBarValue) => void;
  onPress?: (event: GestureResponderEvent, value: IndexBarValue) => void;
  disabled?: boolean;
  size?: ComponentSize;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: IndexBarStyles;
}

export interface IndexBarComponent {
  (props: IndexBarProps): ReactNode;
  Panel: (props: IndexBarPanelProps) => ReactNode;
}
