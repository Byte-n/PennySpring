import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle } from 'react-native';
import type { ComponentSize } from '../../shares/types';
import { resolveLayoutGap } from '../../shares/layoutGap';
import type {
  SpaceAlign,
  SpaceDirection,
  SpaceJustify,
} from '../types';

export interface SpaceStyleOptions {
  align?: SpaceAlign;
  block: boolean;
  direction: SpaceDirection;
  justify?: SpaceJustify;
  wrap: boolean;
}

export interface SpaceItemStyleOptions {
  direction: SpaceDirection;
  gap: number;
  isLast: boolean;
  stretch: boolean;
  wrap: boolean;
}

export function getGap(gap: number | ComponentSize, token: AliasToken): number {
  return typeof gap === 'number' ? gap : resolveLayoutGap(gap, token);
}

export function resolveDirection(direction?: SpaceDirection): SpaceDirection {
  return direction ?? 'horizontal';
}

function mapFlexStartEnd(value?: 'start' | 'end' | 'center') {
  if (value === 'start') {
    return 'flex-start';
  }

  if (value === 'end') {
    return 'flex-end';
  }

  return value;
}

function mapAlignItems(align?: SpaceAlign): ViewStyle['alignItems'] {
  if (align === 'baseline') {
    return 'baseline';
  }

  return mapFlexStartEnd(align);
}

function mapJustifyContent(justify?: SpaceJustify): ViewStyle['justifyContent'] {
  if (justify === 'between') {
    return 'space-between';
  }

  if (justify === 'around') {
    return 'space-around';
  }

  if (justify === 'evenly') {
    return 'space-evenly';
  }

  if (justify === 'stretch') {
    return 'space-between';
  }

  return mapFlexStartEnd(justify);
}

export const useSpaceStyles = createUseSheetStyle(
  (_token, options: SpaceStyleOptions) => ({
    root: {
      alignItems: mapAlignItems(options.align),
      alignSelf: options.block ? 'stretch' : undefined,
      flexDirection: options.direction === 'vertical' ? 'column' : 'row',
      flexWrap:
        options.direction === 'horizontal' && options.wrap ? 'wrap' : undefined,
      justifyContent: mapJustifyContent(options.justify),
      width: options.block ? '100%' : undefined,
    },
    item: {
      flexShrink: 0,
    },
  }),
);

export const useSpaceItemStyles = createUseSheetStyle(
  (_token, options: SpaceItemStyleOptions) => {
    const style: ViewStyle = {
      flexShrink: 0,
      flex: options.stretch ? 1 : undefined,
    };

    if (options.direction === 'vertical') {
      if (!options.isLast) {
        style.marginBottom = options.gap;
      }

      return {
        item: style,
      };
    }

    if (!options.isLast) {
      style.marginRight = options.gap;
    }

    if (options.wrap) {
      style.marginBottom = options.gap;
    }

    return {
      item: style,
    };
  },
);
