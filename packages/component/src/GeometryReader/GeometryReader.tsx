import React, { useState } from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { LayoutChangeEvent } from 'react-native';
import type { Geometry, GeometryReaderProps } from './types';

const useStyles = createUseSheetStyle(() => ({
  root: {
    flex: 1,
  },
}));

export function GeometryReader({ children, style }: GeometryReaderProps) {
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const tokenStyles = useStyles();

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setGeometry({ width, height });
  }

  return (
    <View testID="geometry-reader" style={[tokenStyles.root, style]} onLayout={handleLayout}>
      {geometry ? children(geometry) : null}
    </View>
  );
}
