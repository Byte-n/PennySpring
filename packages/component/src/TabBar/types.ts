import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type TabBarValue = string | number;

export type TabBarSize = ComponentSize;

export interface TabBarItem {
  key: TabBarValue;
  titleText?: string;
  title?: ReactNode;
  icon?: ReactNode;
  activeIcon?: ReactNode;
  badgeText?: string;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabBarStyles {
  tabList?: StyleProp<ViewStyle>;
  tab?: StyleProp<ViewStyle>;
  tabPressed?: StyleProp<ViewStyle>;
  tabActive?: StyleProp<ViewStyle>;
  tabDisabled?: StyleProp<ViewStyle>;
  icon?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  titleTextActive?: StyleProp<TextStyle>;
  titleTextDisabled?: StyleProp<TextStyle>;
  badge?: StyleProp<ViewStyle>;
  badgeText?: StyleProp<TextStyle>;
}

export interface TabBarProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  items: TabBarItem[];
  value?: TabBarValue;
  defaultValue?: TabBarValue;
  onChange?: (value: TabBarValue) => void;
  disabled?: boolean;
  size?: TabBarSize;
  safeAreaInsetBottom?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: TabBarStyles;
  onPress?: (event: GestureResponderEvent, value: TabBarValue) => void;
}
