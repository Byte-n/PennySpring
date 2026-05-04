import React from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import { createUseSheetStyle } from '@pennyspring/theme';
import { HeaderBar } from './HeaderBar';
import type { TopTabNavigatorProps } from './types';

const Tab = createMaterialTopTabNavigator();

const useStyles = createUseSheetStyle((token) => ({
  sceneContainer: {
    backgroundColor: token.colorBgLayout,
  },
}));

function renderHeaderBar(
  props: MaterialTopTabBarProps,
  options: Pick<TopTabNavigatorProps, 'leftActions' | 'rightActions' | 'styles'>
) {
  return (
    <HeaderBar
      descriptors={props.descriptors}
      leftActions={options.leftActions}
      navigation={props.navigation}
      position={props.position}
      rightActions={options.rightActions}
      state={props.state}
      segmentedControlStyles={options.styles?.segmentedControl}
      styles={options.styles?.headerBar}
    />
  );
}

export function TopTabNavigator({
  leftActions,
  rightActions,
  screens,
  styles,
}: TopTabNavigatorProps) {
  const tokenStyles = useStyles();

  return (
    <Tab.Navigator
      screenOptions={{
        lazy: true,
        sceneStyle: [tokenStyles.sceneContainer, styles?.sceneContainer],
        swipeEnabled: true,
      }}
      tabBar={(props) =>
        renderHeaderBar(props, {
          leftActions,
          rightActions,
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
