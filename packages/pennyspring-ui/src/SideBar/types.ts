import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type SideBarValue = string | number;

export type SideBarLayout = 'wrap' | 'scroll';

export interface SideBarItem {
  value: SideBarValue;
  label?: ReactNode;
  disabled?: boolean;
}

export interface SideBarStyles {
  sideBarList?: StyleProp<ViewStyle>;
  sideBar?: StyleProp<ViewStyle>;
  sideBarPressed?: StyleProp<ViewStyle>;
  sideBarActive?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelActive?: StyleProp<TextStyle>;
  labelDisabled?: StyleProp<TextStyle>;
  panel?: StyleProp<ViewStyle>;
}

export interface SideBarProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  items: SideBarItem[];
  value?: SideBarValue;
  defaultValue?: SideBarValue;
  onChange?: (value: SideBarValue) => void;
  disabled?: boolean;
  size?: ComponentSize;
  layout?: SideBarLayout;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: SideBarStyles;
  onPress?: (event: GestureResponderEvent, value: SideBarValue) => void;
  renderContent?: (item: SideBarItem, index: number) => ReactNode;
}
