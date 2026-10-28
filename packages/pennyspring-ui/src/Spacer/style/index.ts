import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../../shares/types';
import { resolveLayoutGap } from '../../shares/layoutGap';
import type { SpacerDirection } from '../types';

export interface SpacerStyleOptions {
  direction: SpacerDirection;
  flex: number;
  size?: ComponentSize;
}

function getGap(size: ComponentSize, token: AliasToken): number {
  return resolveLayoutGap(size, token);
}

export const useStyles = createUseSheetStyle(
  (token, options: SpacerStyleOptions) => {
    const isHorizontal = options.direction === 'horizontal';

    if (options.size) {
      const gap = getGap(options.size, token);

      return {
        root: {
          width: isHorizontal ? gap : '100%',
          height: isHorizontal ? undefined : gap,
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
