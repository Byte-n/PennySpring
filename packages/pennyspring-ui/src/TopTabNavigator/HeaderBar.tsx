import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { SegmentedControl } from './SegmentedControl';
import type { HeaderBarStyles, SegmentedControlStyles } from './types';
import type { StyleProp, ViewStyle } from 'react-native';

interface HeaderBarProps {
  descriptors: React.ComponentProps<typeof SegmentedControl>['descriptors'];
  leftActions?: React.ReactNode;
  navigation: React.ComponentProps<typeof SegmentedControl>['navigation'];
  position?: React.ComponentProps<typeof SegmentedControl>['position'];
  rightActions?: React.ReactNode;
  state: React.ComponentProps<typeof SegmentedControl>['state'];
  style?: StyleProp<ViewStyle>;
  styles?: HeaderBarStyles;
  segmentedControlStyles?: SegmentedControlStyles;
}

const useStyles = createUseSheetStyle((token) => ({
  container: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderBottomColor: token.colorSplit,
    borderBottomWidth: token.lineWidth,
    flexDirection: 'row',
    minHeight: token.controlHeightLG,
    paddingHorizontal: token.paddingMD,
    paddingVertical: token.paddingXS,
  },
  leftActions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  center: {
    alignItems: 'center',
    flex: 2,
  },
  rightActions: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
}));

export function HeaderBar({
  descriptors,
  leftActions,
  navigation,
  position,
  rightActions,
  state,
  style,
  styles,
  segmentedControlStyles,
}: HeaderBarProps) {
  const tokenStyles = useStyles();

  return (
    <View style={[tokenStyles.container, style]}>
      <View style={[tokenStyles.leftActions, styles?.leftActions]}>{leftActions}</View>
      <View style={[tokenStyles.center, styles?.center]}>
        <SegmentedControl
          descriptors={descriptors}
          navigation={navigation}
          position={position}
          state={state}
          styles={segmentedControlStyles}
        />
      </View>
      <View style={[tokenStyles.rightActions, styles?.rightActions]}>{rightActions}</View>
    </View>
  );
}
