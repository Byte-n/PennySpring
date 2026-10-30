import React from 'react';
import { Text as RNText } from 'react-native';
import { useTextColor } from './useTextColor';
import { useStyles } from './style';
import type { TextProps } from './types';

export const Text = React.forwardRef<RNText, TextProps>(function Text({
  size = 'md',
  weight,
  color,
  textAlign,
  style,
  numberOfLines,
  ellipsizeMode,
  selectable,
  onPress,
  onLongPress,
  testID,
  children,
}, ref) {
  const resolvedColor = useTextColor(color);
  const tokenStyles = useStyles({ size, weight, color: resolvedColor, textAlign });

  return (
    <RNText
      ref={ref}
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
});
