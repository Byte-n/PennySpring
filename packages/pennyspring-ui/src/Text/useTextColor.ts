import React from 'react';
import {
  getAliasColorTokenValue,
  useTheme,
} from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextColor, TextSemanticColor } from './types';

type ColorSelector = (token: AliasToken) => string;

const COLOR_MAP: Record<TextSemanticColor, ColorSelector> = {
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

function resolveTextColor(color: TextColor | undefined, token: AliasToken): string {
  if (color === undefined) {
    return token.colorText;
  }

  if (color in COLOR_MAP) {
    return COLOR_MAP[color as TextSemanticColor](token);
  }

  return getAliasColorTokenValue(token, color) ?? token.colorText;
}

export function useTextColor(color: TextColor | undefined): string {
  const { token } = useTheme();

  return React.useMemo(
    () => resolveTextColor(color, token),
    [color, token],
  );
}
