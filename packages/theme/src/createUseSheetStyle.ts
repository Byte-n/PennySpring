import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { AliasToken } from './types';
import { useTheme } from './useTheme';

export type SheetStyle = ViewStyle | TextStyle | ImageStyle;

export type StylesObject = Record<string, SheetStyle>;

export type StyleGenerator<TOptions> = (
  tokens: AliasToken,
  options: TOptions
) => StylesObject;

export type SheetStyleHook<TOptions = void> = (options?: TOptions) => StylesObject;

export function createUseSheetStyle<TOptions = void>(
  generator: StyleGenerator<TOptions>
): SheetStyleHook<TOptions> {
  return function useSheetStyle(options?: TOptions): StylesObject {
    const { token } = useTheme();
    return useMemo(() => {
      return generator(token, options as TOptions);
    }, [token, options]);
  };
}
