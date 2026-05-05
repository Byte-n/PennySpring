import type React from 'react';
import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface TabScreen {
  name: string;
  label: string;
  component: ComponentType<object>;
}

export interface SegmentedControlStyles {
  container?: StyleProp<ViewStyle>;
  track?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  option?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
  activeLabel?: StyleProp<TextStyle>;
  inactiveLabel?: StyleProp<TextStyle>;
}

export interface HeaderBarStyles {
  container?: StyleProp<ViewStyle>;
  leftActions?: StyleProp<ViewStyle>;
  center?: StyleProp<ViewStyle>;
  rightActions?: StyleProp<ViewStyle>;
}

export interface TopTabNavigatorStyles {
  headerBar?: HeaderBarStyles;
  segmentedControl?: SegmentedControlStyles;
  sceneContainer?: StyleProp<ViewStyle>;
}

export interface TopTabNavigatorProps {
  screens: readonly TabScreen[];
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  styles?: TopTabNavigatorStyles;
}
