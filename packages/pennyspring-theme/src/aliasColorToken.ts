import type { AliasColorTokenKey, AliasToken } from './types';

function toColorTokenKey(color: string): keyof AliasToken {
  return `color${color.charAt(0).toUpperCase()}${color.slice(1)}` as keyof AliasToken;
}

export function getAliasColorTokenValue(
  token: AliasToken,
  color: AliasColorTokenKey,
): string;
export function getAliasColorTokenValue(
  token: AliasToken,
  color: string,
): string | undefined;
export function getAliasColorTokenValue(
  token: AliasToken,
  color: string,
): string | undefined {
  if (color in token) {
    return token[color as keyof AliasToken] as string;
  }

  const colorTokenKey = toColorTokenKey(color);
  if (colorTokenKey in token) {
    return token[colorTokenKey] as string;
  }

  return undefined;
}
