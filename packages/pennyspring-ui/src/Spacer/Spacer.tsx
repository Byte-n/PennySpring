import React from 'react';
import { View } from 'react-native';
import type { SpacerProps } from './types';
import { useStyles } from './style';

export function Spacer({ direction = 'horizontal', size, flex = 1, style }: SpacerProps) {
  const tokenStyles = useStyles({ direction, flex, size });

  return <View testID="spacer" style={[tokenStyles.root, style]} />;
}
