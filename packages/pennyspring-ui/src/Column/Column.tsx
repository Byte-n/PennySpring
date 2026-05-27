import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { FlexAlign, FlexJustify, ColumnProps } from '../Row/types';
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
  const toVerticalGap = (value: number | undefined) => {
    if (typeof value !== 'number') {
      return value;
    }

    return value / 2;
  };

  if (gap === 'small') {
    return toVerticalGap(token.paddingXXS);
  }

  if (gap === 'normal') {
    return toVerticalGap(token.paddingXS);
  }

  if (gap === 'large') {
    return toVerticalGap(token.paddingSM);
  }

  return toVerticalGap(gap);
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
  gap,
  children,
  style,
}: ColumnProps) {
  const tokenStyles = useStyles({
    align,
    gap,
    justify,
  });

  return (
    <View testID="column" style={[tokenStyles.root, style]}>
      {children}
    </View>
  );
}
