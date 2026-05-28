import React from 'react';
import { Text as RNText } from 'react-native';
import { useTextColor } from './useTextColor';
import { useStyles } from './style';
import type { TextProps } from './types';

export function Text({
  size = 'md',
  weight,
  color,
  style,
  numberOfLines,
  ellipsizeMode,
  selectable,
  onPress,
  onLongPress,
  testID,
  children,
}: TextProps) {
  const resolvedColor = useTextColor(color);
  const tokenStyles = useStyles({ size, weight, color: resolvedColor });

  return (
    <RNText
      ellipsizeMode={ellipsizeMode}
      numberOfLines={numberOfLines}
      onLongPress={onLongPress}
      onPress={onPress}
      selectable={selectable}
      style={[tokenStyles.text, style]}
      testID={testID}
    >
      {children}
    </RNText>
  );
}
