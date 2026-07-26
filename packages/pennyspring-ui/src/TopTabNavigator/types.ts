import type React from 'react';
import type { ComponentType } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface TabScreen {
  name: string;
  label: string;
  component: ComponentType<object>;
}

export interface RouteLike {
  key: string;
  name: string;
}

export interface DescriptorLike {
  options?: {
    title?: string;
    tabBarLabel?:
      | string
      | ((
          props: { focused: boolean; color: string; children: string }
        ) => React.ReactNode);
  };
}

export interface SegmentedControlProps {
  descriptors: Record<string, DescriptorLike>;
  navigation: {
    navigate: (name: string) => void;
  };
  state: {
    index: number;
    routes: readonly RouteLike[];
  };
  styles?: SegmentedControlStyles;
}

export interface HeaderBarProps {
  descriptors: SegmentedControlProps['descriptors'];
  leftActions?: React.ReactNode;
  navigation: SegmentedControlProps['navigation'];
  rightActions?: React.ReactNode;
  state: SegmentedControlProps['state'];
  style?: StyleProp<ViewStyle>;
  styles?: HeaderBarStyles;
  segmentedControlStyles?: SegmentedControlStyles;
}

export interface SegmentedControlStyles {
  track?: StyleProp<ViewStyle>;
  indicator?: StyleProp<ViewStyle>;
  option?: StyleProp<ViewStyle>;
  label?: StyleProp<TextStyle>;
}

export interface HeaderBarStyles {
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
  initialRouteName?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styles?: TopTabNavigatorStyles;
  onIndexChange?: (index: number) => void;
}
