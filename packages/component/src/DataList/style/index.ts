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
        completeText: {
          color: token.colorTextTertiary,
        },
        footer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: token.paddingXS,
        },
        loadingMoreText: {
          color: token.colorTextSecondary,
        },
      };
    }

    if (size === 'large') {
      return {
        completeText: {
          color: token.colorTextTertiary,
        },
        footer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: token.paddingMD,
        },
        loadingMoreText: {
          color: token.colorTextSecondary,
        },
      };
    }

    return {
      completeText: {
        color: token.colorTextTertiary,
      },
      footer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: token.paddingSM,
      },
      loadingMoreText: {
        color: token.colorTextSecondary,
      },
    };
  },
);
