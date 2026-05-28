import { createUseSheetStyle } from '@pennyspring/theme';
import type { TextSize } from '../../Text';
import type { ComponentSize } from '../../shares/types';

export interface DataListStyleOptions {
  size: ComponentSize;
}

export function resolveTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

export const useStyles = createUseSheetStyle(
  (token, { size }: DataListStyleOptions) => {
    if (size === 'small') {
      return {
        completeText: {},
        footer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: token.paddingXS / 2,
        },
        loadingMoreText: {},
      };
    }

    if (size === 'large') {
      return {
        completeText: {},
        footer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: token.paddingMD / 2,
        },
        loadingMoreText: {},
      };
    }

    return {
      completeText: {},
      footer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: token.paddingSM / 2,
      },
      loadingMoreText: {},
    };
  },
);
