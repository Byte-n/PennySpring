import React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { FlexAlign, FlexJustify, ColumnProps } from '../Row/types';

function mapAlignItems(align?: FlexAlign): ViewStyle['alignItems'] {
  if (align === 'start') return 'flex-start';
  if (align === 'end') return 'flex-end';
  if (align === 'baseline') return 'baseline';
  if (align === 'center') return 'center';
  return align ?? 'stretch';
}

function mapJustifyContent(justify?: FlexJustify): ViewStyle['justifyContent'] {
  if (justify === 'start') return 'flex-start';
  if (justify === 'end') return 'flex-end';
  if (justify === 'between') return 'space-between';
  if (justify === 'around') return 'space-around';
  if (justify === 'evenly') return 'space-evenly';
  return justify;
}

export function Column({
  align,
  justify,
  gap,
  children,
  style,
}: ColumnProps) {
  const baseStyle: ViewStyle = {
    flexDirection: 'column',
    alignItems: mapAlignItems(align),
    justifyContent: mapJustifyContent(justify),
    gap,
  };

  return (
    <View testID="column" style={[baseStyle, style]}>
      {children}
    </View>
  );
}
