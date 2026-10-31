import React from 'react';
import { View } from 'react-native';
import type { RowProps } from './types';
import { useStyles } from './style';

export function Row({
  align,
  justify,
  gap = 0,
  wrap = false,
  children,
  style,
  testID = 'row',
}: RowProps) {
  const tokenStyles = useStyles({
    align,
    gap,
    justify,
    wrap,
  });

  return (
    <View testID={testID} style={[tokenStyles.root, style]}>
      {children}
    </View>
  );
}
