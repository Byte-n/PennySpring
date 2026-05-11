import React from 'react';
import { Text } from 'react-native';
import { createUseSheetStyle } from '../createUseSheetStyle';
import { useTheme } from '../useTheme';
import { Section } from './components/Section';
import type { TextStyle } from 'react-native';

interface TypographyStyleOptions {
  fontFamily: string;
  heading1Size: number;
  heading2Size: number;
  heading3Size: number;
  heading4Size: number;
  heading5Size: number;
  bodyXlSize: number;
  bodyLgSize: number;
  bodySize: number;
  bodySmSize: number;
}

const useTypographyStyles = createUseSheetStyle<TypographyStyleOptions>(
  (tokens, options) => {
    const headingFontWeight = 'bold' as TextStyle['fontWeight'];

    return {
      familyTitle: {
        fontSize: tokens.fontSizeSM,
        fontWeight: String(tokens.fontWeightStrong) as TextStyle['fontWeight'],
        marginBottom: tokens.marginXXS,
        color: tokens.colorText,
      },
      heading1: {
        color: tokens.colorText,
        fontSize: options.heading1Size,
        fontFamily: options.fontFamily,
        fontWeight: headingFontWeight,
      },
      heading2: {
        color: tokens.colorText,
        fontSize: options.heading2Size,
        fontFamily: options.fontFamily,
        fontWeight: headingFontWeight,
      },
      heading3: {
        color: tokens.colorText,
        fontSize: options.heading3Size,
        fontFamily: options.fontFamily,
        fontWeight: headingFontWeight,
      },
      heading4: {
        color: tokens.colorText,
        fontSize: options.heading4Size,
        fontFamily: options.fontFamily,
        fontWeight: headingFontWeight,
      },
      heading5: {
        color: tokens.colorText,
        fontSize: options.heading5Size,
        fontFamily: options.fontFamily,
        fontWeight: headingFontWeight,
      },
      bodyXl: {
        color: tokens.colorText,
        fontSize: options.bodyXlSize,
        fontFamily: options.fontFamily,
      },
      bodyLg: {
        color: tokens.colorText,
        fontSize: options.bodyLgSize,
        fontFamily: options.fontFamily,
      },
      body: {
        color: tokens.colorText,
        fontSize: options.bodySize,
        fontFamily: options.fontFamily,
      },
      bodySm: {
        color: tokens.colorText,
        fontSize: options.bodySmSize,
        fontFamily: options.fontFamily,
      },
    };
  },
);

export function TypographyPreview() {
  const { token } = useTheme();
  const styles = useTypographyStyles({
    fontFamily: token.fontFamily,
    heading1Size: token.fontSizeHeading1,
    heading2Size: token.fontSizeHeading2,
    heading3Size: token.fontSizeHeading3,
    heading4Size: token.fontSizeHeading4,
    heading5Size: token.fontSizeHeading5,
    bodyXlSize: token.fontSizeXL,
    bodyLgSize: token.fontSizeLG,
    bodySize: token.fontSize,
    bodySmSize: token.fontSizeSM,
  });

  return (
    <Section title="Typography">
      <Text style={styles.heading1}>H1 - {token.fontSizeHeading1}px</Text>
      <Text style={styles.heading2}>H2 - {token.fontSizeHeading2}px</Text>
      <Text style={styles.heading3}>H3 - {token.fontSizeHeading3}px</Text>
      <Text style={styles.heading4}>H4 - {token.fontSizeHeading4}px</Text>
      <Text style={styles.heading5}>H5 - {token.fontSizeHeading5}px</Text>
      <Text style={styles.bodyXl}>Body XL - {token.fontSizeXL}px</Text>
      <Text style={styles.bodyLg}>Body LG - {token.fontSizeLG}px</Text>
      <Text style={styles.body}>Body - {token.fontSize}px</Text>
      <Text style={styles.bodySm}>Body SM - {token.fontSizeSM}px</Text>
      <Text style={styles.familyTitle}>Font: {token.fontFamily}</Text>
    </Section>
  );
}
