import type { ComponentSize } from '../shares/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { SpacerDirection, SpacerProps } from './types';

interface SpacerStyleOptions {
  direction: SpacerDirection;
  flex: number;
  size?: ComponentSize;
}

function getGap(size: ComponentSize, token: { paddingXXS: number; paddingXS: number; paddingSM: number }) {
  if (size === 'small') {
    return token.paddingXXS;
  }

  if (size === 'large') {
    return token.paddingSM;
  }

  return token.paddingXS;
}

const useStyles = createUseSheetStyle(
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

export function Spacer({ direction = 'horizontal', size, flex = 1, style }: SpacerProps) {
  const tokenStyles = useStyles({ direction, flex, size });

  return <View testID="spacer" style={[tokenStyles.root, style]} />;
}
