import type { ComponentSize } from '../shares/types';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Text } from '../Text';
import { Row } from '../Row';
import { Column } from '../Column';
import type { AliasToken } from '@pennyspring/theme';
import type { LoadingProps } from './types';
import type { TextSize } from '../Text';

interface SizeStyleConfig {
  indicatorSize: (token: AliasToken) => number;
  textSize: TextSize;
  gap: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
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

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function resolveIndicatorSize(token: AliasToken, size: ComponentSize): number {
  return SIZE_STYLE_MAP[size].indicatorSize(token);
}

function resolveTextSize(size: ComponentSize): TextSize {
  return SIZE_STYLE_MAP[size].textSize;
}

const useStyles = createUseSheetStyle(_token => ({
  indicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export function Loading({
  size,
  text,
  vertical = false,
  indicator,
  style,
  styles,
  animating = true,
  hidesWhenStopped = true,
  ...rest
}: LoadingProps) {
  const resolvedSize = resolveSize(size);
  const tokenStyles = useStyles();
  const { token } = useTheme();

  const Layout = vertical ? Column : Row;
  const gap = SIZE_STYLE_MAP[resolvedSize].gap(token);

  return (
    <Layout align="center" gap={gap} style={style}>
      <View style={[tokenStyles.indicator, styles?.indicator]}>
        {indicator ?? (
          <ActivityIndicator
            {...rest}
            animating={animating}
            color={token.colorPrimary}
            hidesWhenStopped={hidesWhenStopped}
            size={resolveIndicatorSize(token, resolvedSize)}
          />
        )}
      </View>
      {text ? (
        <Text
          color="secondary"
          size={resolveTextSize(resolvedSize)}
          style={styles?.text}
        >
          {text}
        </Text>
      ) : null}
    </Layout>
  );
}
