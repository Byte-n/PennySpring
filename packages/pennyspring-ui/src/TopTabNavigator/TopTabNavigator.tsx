import React, { useRef } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import { HeaderBar } from './HeaderBar';
import { useTopTabNavigatorStyles } from './style';
import type { TopTabNavigatorProps } from './types';

const Tab = createMaterialTopTabNavigator();

function renderHeaderBar(
  props: MaterialTopTabBarProps,
  options: Pick<TopTabNavigatorProps, 'leftActions' | 'rightActions' | 'style' | 'styles'>
) {
  return (
    <HeaderBar
      descriptors={props.descriptors}
      leftActions={options.leftActions}
      navigation={props.navigation}
      rightActions={options.rightActions}
      state={props.state}
      style={options.style}
      segmentedControlStyles={options.styles?.segmentedControl}
      styles={options.styles?.headerBar}
    />
  );
}

export function TopTabNavigator({
  initialRouteName,
  leftActions,
  rightActions,
  screens,
  style,
  styles,
  onIndexChange,
}: TopTabNavigatorProps) {
  const tokenStyles = useTopTabNavigatorStyles();
  const prevIndexRef = useRef<number>(-1);

  const handleTabBarProps = (props: MaterialTopTabBarProps) => {
    const currentIndex = props.state.index;

    if (prevIndexRef.current !== currentIndex) {
      prevIndexRef.current = currentIndex;
      onIndexChange?.(currentIndex);
    }

    return renderHeaderBar(props, {
      leftActions,
      rightActions,
      style,
      styles,
    });
  };

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        lazy: true,
        sceneStyle: [tokenStyles.sceneContainer, styles?.sceneContainer],
        swipeEnabled: true,
      }}
      tabBar={handleTabBarProps}
    >
      {screens.map((screen) => (
        <Tab.Screen
          component={screen.component}
          key={screen.name}
          name={screen.name}
          options={{ title: screen.label }}
        />
      ))}
    </Tab.Navigator>
  );
}
