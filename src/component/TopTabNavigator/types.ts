import type React from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import type { StyleProp, ViewStyle } from 'react-native';

export interface TabScreen {
  name: string;
  label?: ReactNode;
  labelText?: string;
  component: ComponentType<object>;
}

export interface HeaderBarProps {
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: HeaderBarStyles;
  tabBarProps: MaterialTopTabBarProps;
}

export interface HeaderBarStyles {
  leftActions?: StyleProp<ViewStyle>;
  center?: StyleProp<ViewStyle>;
  rightActions?: StyleProp<ViewStyle>;
}

export interface TopTabNavigatorStyles {
  headerBar?: HeaderBarStyles;
  sceneContainer?: StyleProp<ViewStyle>;
}

export interface TopTabNavigatorProps {
  screens: readonly TabScreen[];
  initialRouteName?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: TopTabNavigatorStyles;
  onIndexChange?: (index: number) => void;
}
