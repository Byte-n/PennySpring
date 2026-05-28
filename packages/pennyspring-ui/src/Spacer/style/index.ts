import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import type { SpacerDirection } from '../types';

export interface SpacerStyleOptions {
  direction: SpacerDirection;
  flex: number;
  size?: ComponentSize;
}

function getGap(size: ComponentSize, token: AliasToken): number {
  if (size === 'small') {
    return token.paddingXXS;
  }

  if (size === 'large') {
    return token.paddingSM;
  }

  return token.paddingXS;
}

export const useStyles = createUseSheetStyle(
  (token, options: SpacerStyleOptions) => {
    const isHorizontal = options.direction === 'horizontal';

    if (options.size) {
      const gap = getGap(options.size, token);

      return {
        root: {
          width: isHorizontal ? gap : undefined,
          height: isHorizontal ? undefined : gap / 2,
        },
      };
    }

    return {
      root: {
        flex: options.flex,
      },
    };
  },
);
