import React from 'react';
import { getAliasColorTokenValue, useTheme } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { IconColor, IconSemanticColor } from './types';

type ColorSelector = (token: AliasToken) => string;

const COLOR_MAP: Record<IconSemanticColor, ColorSelector> = {
  base: token => token.colorTextBase,
  default: token => token.colorText,
  secondary: token => token.colorTextSecondary,
  tertiary: token => token.colorTextTertiary,
  quaternary: token => token.colorTextQuaternary,
  heading: token => token.colorTextHeading,
  label: token => token.colorTextLabel,
  description: token => token.colorTextDescription,
  disabled: token => token.colorTextDisabled,
  placeholder: token => token.colorTextPlaceholder,
  lightSolid: token => token.colorTextLightSolid,
};

function resolveIconColor(
  color: IconColor | undefined,
  token: AliasToken,
): string {
  if (color === undefined) {
    return token.colorIcon;
  }

  if (color in COLOR_MAP) {
    return COLOR_MAP[color as IconSemanticColor](token);
  }

  return getAliasColorTokenValue(token, color) ?? token.colorIcon;
}

export function useIconColor(color: IconColor | undefined): string {
  const { token } = useTheme();

  return React.useMemo(() => resolveIconColor(color, token), [color, token]);
}
