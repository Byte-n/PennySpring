import React, { useEffect } from 'react';
import {
  createMaterialTopTabNavigator,
  type MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import { HeaderBar } from './HeaderBar';
import { useTopTabNavigatorStyles } from './style';
import type { TopTabNavigatorProps } from './types';
import { useNavigationState } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

function renderHeaderBar(
  props: MaterialTopTabBarProps,
  options: Pick<TopTabNavigatorProps, 'leftActions' | 'rightActions' | 'style' | 'styles'>
) {
  return (
    <HeaderBar
      leftActions={options.leftActions}
      rightActions={options.rightActions}
      style={options.style}
      styles={options.styles?.headerBar}
      tabBarProps={props}
    />
  );
}

/**
 * 自定义的 Tab.Navigator 组件，依旧需要在全局的 NavigationContainer 下使用
 */
export function TopTabNavigator({
  backBehavior = 'none',
  initialRouteName,
  leftActions,
  rightActions,
  screens,
  style,
  styles,
  onIndexChange,
}: TopTabNavigatorProps) {
  const tokenStyles = useTopTabNavigatorStyles();
  const currentIndex = useNavigationState(state => state.index);

  useEffect(() => {
    onIndexChange?.(currentIndex);
  }, [currentIndex]);

  const handleTabBarProps = (props: MaterialTopTabBarProps) => {
    return renderHeaderBar(props, {
      leftActions,
      rightActions,
      style,
      styles,
    });
  };

  return (
    <Tab.Navigator
      backBehavior={backBehavior}
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
          options={{
            title: screen.labelText,
            tabBarLabel: screen.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
