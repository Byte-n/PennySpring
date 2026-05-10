import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { LoadingProps, LoadingSize } from './types';
import type { TextSize } from '../Text';

interface LoadingStyleOptions {
  size: LoadingSize;
  vertical: boolean;
}

interface SizeStyleConfig {
  indicatorSize: (token: AliasToken) => number;
  textSize: TextSize;
  gap: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<LoadingSize, SizeStyleConfig> = {
  small: {
    indicatorSize: token => token.fontSize,
    textSize: 'sm',
    gap: token => token.marginXXS,
  },
  normal: {
    indicatorSize: token => token.fontSizeXL,
    textSize: 'md',
    gap: token => token.marginXS,
  },
  large: {
    indicatorSize: token => token.controlHeightSM,
    textSize: 'lg',
    gap: token => token.marginSM,
  },
};

function resolveSize(size?: LoadingSize): LoadingSize {
  return size ?? 'normal';
}

function shouldRenderText(text: ReactNode): boolean {
  return text !== undefined && text !== null && text !== false;
}

function resolveIndicatorSize(token: AliasToken, size: LoadingSize): number {
  return SIZE_STYLE_MAP[size].indicatorSize(token);
}

function resolveTextSize(size: LoadingSize): TextSize {
  return SIZE_STYLE_MAP[size].textSize;
}

const useStyles = createUseSheetStyle(
  (token, { size, vertical }: LoadingStyleOptions) => ({
    root: {
      alignItems: 'center',
      flexDirection: vertical ? 'column' : 'row',
      gap: SIZE_STYLE_MAP[size].gap(token),
    },
    indicator: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: token.colorTextSecondary,
    },
  }),
);

export function Loading({
  size,
  text,
  vertical = false,
  indicator,
  style,
  styles,
  animating = true,
  hidesWhenStopped = true,
  color,
  ...rest
}: LoadingProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles({ size: resolvedSize, vertical });
  const { token } = useTheme();

  return (
    <View style={[tokenStyles.root, style]}>
      <View style={[tokenStyles.indicator, styles?.indicator]}>
        {indicator ?? (
          <ActivityIndicator
            {...rest}
            animating={animating}
            color={color ?? token.colorPrimary}
            hidesWhenStopped={hidesWhenStopped}
            size={resolveIndicatorSize(token, resolvedSize)}
          />
        )}
      </View>
      {shouldRenderText(text) ? (
        <Text
          size={resolveTextSize(resolvedSize)}
          style={[tokenStyles.text, styles?.text]}
        >
          {text}
        </Text>
      ) : null}
    </View>
  );
}
