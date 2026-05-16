import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { SpacerProps } from './types';

export function Spacer({ size, flex, min, max, style }: SpacerProps) {
  const baseStyle: ViewStyle = {};

  if (size != null) {
    baseStyle.width = size;
    baseStyle.height = size;
  } else {
    baseStyle.flex = flex ?? 1;
  }

  if (min != null) {
    baseStyle.minWidth = min;
    baseStyle.minHeight = min;
  }

  if (max != null) {
    baseStyle.maxWidth = max;
    baseStyle.maxHeight = max;
  }

  return <View testID="spacer" style={[baseStyle, style]} />;
}
