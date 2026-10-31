import type { AliasToken } from '@pennyspring/ui';

export function categoryPalette(token: AliasToken): string[] {
  return [
    token.blue6,
    token.cyan6,
    token.gold6,
    token.purple6,
    token.orange6,
    token.magenta6,
  ];
}

export function categoryColorAt(index: number, token: AliasToken): string {
  const palette = categoryPalette(token);
  return palette[index % palette.length];
}
