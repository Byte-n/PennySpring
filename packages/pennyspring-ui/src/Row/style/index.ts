import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { FlexAlign, FlexJustify } from '../types';
import type { ComponentSize } from '../../shares/types';
import { resolveLayoutGap } from '../../shares/layoutGap';

export interface RowStyleOptions {
  align?: FlexAlign;
  gap?: number | ComponentSize;
  justify?: FlexJustify;
  wrap: boolean;
}

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

function resolveGap(
  gap: number | ComponentSize | undefined,
  token: AliasToken,
) {
  if (gap === undefined) {
    return undefined;
  }

  return typeof gap === 'number' ? gap : resolveLayoutGap(gap, token);
}

export const useStyles = createUseSheetStyle(
  (token, { align, gap, justify, wrap }: RowStyleOptions) => ({
    root: {
      alignItems: mapAlignItems(align),
      flexDirection: 'row',
      flexWrap: wrap ? 'wrap' : undefined,
      gap: resolveGap(gap, token),
      justifyContent: mapJustifyContent(justify),
    },
  }),
);
