import React from 'react';
import { View } from 'react-native';
import { MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { useTheme } from '@pennyspring/ui';
import { useHeaderBarStyles } from './style';
import type { HeaderBarProps } from './types';
import { Row } from '@pennyspring/ui';

export function HeaderBar({
  leftActions,
  rightActions,
  style,
  styles,
  tabBarProps,
}: HeaderBarProps) {
  const tokenStyles = useHeaderBarStyles();
  const { token } = useTheme();
  const themedDescriptors = Object.fromEntries(
    Object.entries(tabBarProps.descriptors).map(([key, descriptor]) => [
      key,
      {
        ...descriptor,
        options: {
          ...descriptor.options,
          tabBarActiveTintColor: token.colorPrimary,
          tabBarInactiveTintColor: token.colorTextTertiary,
          tabBarIndicatorStyle: tokenStyles.tabBarIndicator,
          tabBarItemStyle: tokenStyles.tabBarItem,
          tabBarLabelStyle: tokenStyles.tabBarLabel,
          tabBarStyle: tokenStyles.tabBar,
        },
      },
    ]),
  );

  return (
    <Row wrap={false} style={[tokenStyles.container, style]}>
      {leftActions && (
        <View style={[tokenStyles.leftActions, styles?.leftActions]}>
          {leftActions}
        </View>
      )}
      <View style={[tokenStyles.center, styles?.center]}>
        <MaterialTopTabBar
          {...tabBarProps}
          descriptors={themedDescriptors}
        />
      </View>
      {rightActions && (
        <View style={[tokenStyles.rightActions, styles?.rightActions]}>
          {rightActions}
        </View>
      )}
    </Row>
  );
}
