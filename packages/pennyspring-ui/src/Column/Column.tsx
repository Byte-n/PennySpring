import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { FlexAlign, FlexJustify, ColumnProps } from './types';
import type { ComponentSize } from '../shares/types';

interface ColumnStyleOptions {
  align?: FlexAlign;
  gap?: number | ComponentSize;
  justify?: FlexJustify;
}

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

function resolveGap(gap: number | ComponentSize | undefined, token: AliasToken) {
  if (gap === 'small') {
    return token.paddingXXS;
  }

  if (gap === 'normal') {
    return token.paddingXS;
  }

  if (gap === 'large') {
    return token.paddingSM;
  }

  return gap;
}

const useStyles = createUseSheetStyle(
  (token, { align, gap, justify }: ColumnStyleOptions) => ({
    root: {
      alignItems: mapAlignItems(align),
      flexDirection: 'column',
      gap: resolveGap(gap, token),
      justifyContent: mapJustifyContent(justify),
    },
  }),
);

export function Column({
  align,
  justify,
  gap = 'normal',
  children,
  style,
  testID = 'column',
}: ColumnProps) {
  const tokenStyles = useStyles({
    align,
    gap,
    justify,
  });

  return (
    <View testID={testID} style={[tokenStyles.root, style]}>
      {children}
    </View>
  );
}
