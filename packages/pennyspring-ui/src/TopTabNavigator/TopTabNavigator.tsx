import React from 'react';
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
}: TopTabNavigatorProps) {
  const tokenStyles = useTopTabNavigatorStyles();

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        lazy: true,
        sceneStyle: [tokenStyles.sceneContainer, styles?.sceneContainer],
        swipeEnabled: true,
      }}
      tabBar={(props) =>
        renderHeaderBar(props, {
          leftActions,
          rightActions,
          style,
          styles,
        })
      }
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
