import React from 'react';
import { Text as RNText } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import type { TextProps, TextSize } from './types';

interface SizeConfig {
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

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

const useStyles = createUseSheetStyle<{ size: TextSize }>((token, { size }) => {
  const config = SIZE_MAP[size];

  return {
    text: {
      fontFamily: token.fontFamily,
      fontSize: config.fontSize(token),
      lineHeight: config.lineHeight(token),
      color: token.colorText,
    },
  };
});

export function Text({ size = 'md', style, children, ...rest }: TextProps) {
  const tokenStyles = useStyles({ size });

  return (
    <RNText {...rest} style={[tokenStyles.text, style]}>
      {children}
    </RNText>
  );
}
