import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { AliasToken } from './types';
import { useTheme } from './useTheme';

export type SheetStyle = ViewStyle | TextStyle | ImageStyle;

export type StylesObject = Record<string, SheetStyle>;

type StyleOptions = [] | [unknown];

export type StyleGenerator<TStyles extends StylesObject> = (
  tokens: AliasToken
) => TStyles;

export type StyleGeneratorWithOptions<
  TOptions,
  TStyles extends StylesObject,
> = (
  tokens: AliasToken,
  options: TOptions
) => TStyles;

export type SheetStyleHook<TStyles extends StylesObject> = () => TStyles;

export type SheetStyleHookWithOptions<
  TOptions,
  TStyles extends StylesObject,
> = (options: TOptions) => TStyles;

export function createUseSheetStyle<
  TOptions extends StyleOptions,
  TStyles extends StylesObject,
>(
  generator: (tokens: AliasToken, ...options: TOptions) => TStyles
): (...options: TOptions) => TStyles {
  return function useSheetStyle(...options: TOptions): TStyles {
    const { token } = useTheme();
    return useMemo(() => {
      return generator(token, ...options);
    }, [token, options]);
  };
}
