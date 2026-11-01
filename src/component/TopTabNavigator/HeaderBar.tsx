import React from 'react';
import { MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { Column, Row, useTheme } from '@pennyspring/ui';
import { useHeaderBarStyles } from './style';
import type { HeaderBarProps } from './types';

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
          tabBarPressColor: token.colorFillQuaternary,
          tabBarStyle: tokenStyles.tabBar,
        },
      },
    ]),
  );

  return (
    <Column style={[tokenStyles.container, style]}>
      <Row align="center" style={tokenStyles.topRow} wrap={false}>
        <Row style={[tokenStyles.leftActions, styles?.leftActions]}>
          {leftActions}
        </Row>
        <Row style={[tokenStyles.rightActions, styles?.rightActions]}>
          {rightActions}
        </Row>
      </Row>
      <Column style={[tokenStyles.tabsRow, styles?.center]}>
        <MaterialTopTabBar {...tabBarProps} descriptors={themedDescriptors} />
      </Column>
    </Column>
  );
}
