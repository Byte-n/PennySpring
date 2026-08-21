import React from 'react';
import { View } from 'react-native';
import { SegmentedControl } from './SegmentedControl';
import { useHeaderBarStyles } from './style';
import type { HeaderBarProps } from './types';
import { Row } from '@pennyspring/ui';

export function HeaderBar({
  descriptors,
  leftActions,
  navigation,
  rightActions,
  state,
  style,
  styles,
  segmentedControlStyles,
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
        <SegmentedControl
          descriptors={descriptors}
          navigation={navigation}
          state={state}
          styles={segmentedControlStyles}
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
