import type { AliasColorTokenKey, PresetColorKey } from '@pennyspring/theme';

export type SemanticPresetColor<TSemantic extends string> =
  TSemantic | PresetColorKey;

export type SemanticAliasColor<TSemantic extends string> =
  TSemantic | AliasColorTokenKey;
