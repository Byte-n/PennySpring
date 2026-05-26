import React from 'react';
import { Text as RNText } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextStyle } from 'react-native';
import { useTextColor } from './useTextColor';
import type {
  TextProps,
  TextSize,
  TextWeight,
} from './types';

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

interface TextStyleOptions {
  size: TextSize;
  weight?: TextWeight;
  color: string;
}

type FontWeightSelector = (token: AliasToken) => TextStyle['fontWeight'];

const SIZE_MAP: Record<TextSize, SizeConfig> = {
  sm: {
    fontSize: t => t.fontSizeSM,
    lineHeight: t => t.lineHeightSM,
  },
  md: {
    fontSize: t => t.fontSize,
    lineHeight: t => t.lineHeight,
  },
  lg: {
    fontSize: t => t.fontSizeLG,
    lineHeight: t => t.lineHeightLG,
  },
  xl: {
    fontSize: t => t.fontSizeXL,
    lineHeight: t => t.lineHeightXL,
  },
  h1: {
    fontSize: t => t.fontSizeHeading1,
    lineHeight: t => t.lineHeightHeading1,
  },
  h2: {
    fontSize: t => t.fontSizeHeading2,
    lineHeight: t => t.lineHeightHeading2,
  },
  h3: {
    fontSize: t => t.fontSizeHeading3,
    lineHeight: t => t.lineHeightHeading3,
  },
  h4: {
    fontSize: t => t.fontSizeHeading4,
    lineHeight: t => t.lineHeightHeading4,
  },
  h5: {
    fontSize: t => t.fontSizeHeading5,
    lineHeight: t => t.lineHeightHeading5,
  },
};

const WEIGHT_MAP: Record<TextWeight, FontWeightSelector> = {
  light: t => String(t.fontWeightLight) as TextStyle['fontWeight'],
  regular: t => String(t.fontWeightRegular) as TextStyle['fontWeight'],
  medium: t => String(t.fontWeightMedium) as TextStyle['fontWeight'],
  semibold: t => String(t.fontWeightSemiBold) as TextStyle['fontWeight'],
  bold: t => String(t.fontWeightBold) as TextStyle['fontWeight'],
  strong: t => String(t.fontWeightStrong) as TextStyle['fontWeight'],
};

const SIZE_DEFAULT_WEIGHT_MAP: Record<TextSize, TextWeight> = {
  sm: 'regular',
  md: 'regular',
  lg: 'regular',
  xl: 'regular',
  h1: 'strong',
  h2: 'strong',
  h3: 'strong',
  h4: 'strong',
  h5: 'strong',
};

const useStyles = createUseSheetStyle(
  (token, { size, weight, color }: TextStyleOptions) => {
    const config = SIZE_MAP[size];
    const resolvedWeight = weight ?? SIZE_DEFAULT_WEIGHT_MAP[size];

    return {
      text: {
        fontFamily: token.fontFamily,
        fontSize: config.fontSize(token),
        lineHeight: config.lineHeight(token),
        fontWeight: WEIGHT_MAP[resolvedWeight](token),
        color,
      },
    };
  },
);

export function Text({
  size = 'md',
  weight,
  color,
  style,
  numberOfLines,
  ellipsizeMode,
  selectable,
  onPress,
  onLongPress,
  testID,
  children,
}: TextProps) {
  const resolvedColor = useTextColor(color);
  const tokenStyles = useStyles({ size, weight, color: resolvedColor });

  return (
    <RNText
      ellipsizeMode={ellipsizeMode}
      numberOfLines={numberOfLines}
      onLongPress={onLongPress}
      onPress={onPress}
      selectable={selectable}
      style={[tokenStyles.text, style]}
      testID={testID}
    >
      {children}
    </RNText>
  );
}
