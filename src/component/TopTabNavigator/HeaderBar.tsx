import React from 'react';
import { View } from 'react-native';
import { MaterialTopTabBar } from '@react-navigation/material-top-tabs';
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

  return (
    <Row wrap={false} style={[tokenStyles.container, style]}>
      {leftActions && (
        <View style={[tokenStyles.leftActions, styles?.leftActions]}>
          {leftActions}
        </View>
      )}
      <View style={[tokenStyles.center, styles?.center]}>
        <MaterialTopTabBar {...tabBarProps}/>
      </View>
      {rightActions && (
        <View style={[tokenStyles.rightActions, styles?.rightActions]}>
          {rightActions}
        </View>
      )}
    </Row>
  );
}
