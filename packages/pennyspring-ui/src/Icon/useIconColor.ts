import React from 'react';
import {
  getAliasColorTokenValue,
  useTheme,
} from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { IconColor, IconSemanticColor } from './types';

type ColorSelector = (token: AliasToken) => string;

const COLOR_MAP: Record<IconSemanticColor, ColorSelector> = {
  default: token => token.colorIcon,
  primary: token => token.colorPrimary,
  success: token => token.colorSuccess,
  warning: token => token.colorWarning,
  danger: token => token.colorError,
  info: token => token.colorInfo,
};

function resolveIconColor(color: IconColor | string | undefined, token: AliasToken): string {
  if (color === undefined) {
    return token.colorIcon;
  }

  if (color in COLOR_MAP) {
    return COLOR_MAP[color as IconSemanticColor](token);
  }

  return getAliasColorTokenValue(token, color) ?? color;
}

export function useIconColor(color: IconColor | string | undefined): string {
  const { token } = useTheme();

  return React.useMemo(
    () => resolveIconColor(color, token),
    [color, token],
  );
}
