import type React from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import type { TabRouterOptions } from '@react-navigation/native';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Tab 的返回行为。默认 `none`：GO_BACK 不被 tab 路由消费，
 * 会冒泡到父级导航器（例如上层 Stack）处理。
 */
export type TopTabBackBehavior = NonNullable<TabRouterOptions['backBehavior']>;

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
  /** 默认 `none`：返回动作冒泡给父级导航器，而不是切回首个 tab。 */
  backBehavior?: TopTabBackBehavior;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: TopTabNavigatorStyles;
  onIndexChange?: (index: number) => void;
}
