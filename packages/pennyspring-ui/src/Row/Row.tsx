import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { FlexAlign, FlexJustify, RowProps } from './types';

function mapAlignItems(align?: FlexAlign): ViewStyle['alignItems'] {
  if (align === 'start') return 'flex-start';
  if (align === 'end') return 'flex-end';
  if (align === 'baseline') return 'baseline';
  if (align === 'stretch') return 'stretch';
  return align ?? 'center';
}

function mapJustifyContent(justify?: FlexJustify): ViewStyle['justifyContent'] {
  if (justify === 'start') return 'flex-start';
  if (justify === 'end') return 'flex-end';
  if (justify === 'between') return 'space-between';
  if (justify === 'around') return 'space-around';
  if (justify === 'evenly') return 'space-evenly';
  return justify;
}

export function Row({
  align,
  justify,
  gap,
  wrap = false,
  children,
  style,
}: RowProps) {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: mapAlignItems(align),
    justifyContent: mapJustifyContent(justify),
    gap,
    flexWrap: wrap ? 'wrap' : undefined,
  };

  return (
    <View testID="row" style={[baseStyle, style]}>
      {children}
    </View>
  );
}
