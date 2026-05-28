import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';

export type TabsValue = string | number;

export type TabsLayout = 'wrap' | 'scroll';

export interface TabsItem {
  value: TabsValue;
  labelText?: string;
  label?: ReactNode | null;
  disabled?: boolean;
}

export interface TabsStyles {
  tabList?: StyleProp<ViewStyle>;
  tab?: StyleProp<ViewStyle>;
  tabPressed?: StyleProp<ViewStyle>;
  tabActive?: StyleProp<ViewStyle>;
  tabDisabled?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  labelActive?: StyleProp<TextStyle>;
  labelDisabled?: StyleProp<TextStyle>;
  panel?: StyleProp<ViewStyle>;
}

export interface TabsProps
  extends Omit<PressableProps, 'style' | 'children' | 'disabled' | 'onPress'> {
  items: TabsItem[];
  value?: TabsValue;
  defaultValue?: TabsValue;
  onChange?: (value: TabsValue) => void;
  disabled?: boolean;
  size?: ComponentSize;
  layout?: TabsLayout;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
  styles?: TabsStyles;
  onPress?: (event: GestureResponderEvent, value: TabsValue) => void;
  renderContent?: (item: TabsItem, index: number) => ReactNode;
}
