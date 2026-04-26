import React from 'react';
import { Text } from 'react-native';
import { createUseSheetStyle } from '../createUseSheetStyle';
import { useTheme } from '../useTheme';
import { Section } from './components/Section';

const useTypographyStyles = createUseSheetStyle((tokens) => ({
  familyTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: tokens.colorText },
  heading: { color: tokens.colorText },
  body: { color: tokens.colorText },
}));

export function TypographyPreview() {
  const { token } = useTheme();
  const styles = useTypographyStyles();

  return (
    <Section title="Typography">
      <Text style={[styles.heading, { fontSize: token.fontSizeHeading1, fontFamily: token.fontFamily, fontWeight: 'bold' }]}>
        H1 - {token.fontSizeHeading1}px
      </Text>
      <Text style={[styles.heading, { fontSize: token.fontSizeHeading2, fontFamily: token.fontFamily, fontWeight: 'bold' }]}>
        H2 - {token.fontSizeHeading2}px
      </Text>
      <Text style={[styles.heading, { fontSize: token.fontSizeHeading3, fontFamily: token.fontFamily, fontWeight: 'bold' }]}>
        H3 - {token.fontSizeHeading3}px
      </Text>
      <Text style={[styles.heading, { fontSize: token.fontSizeHeading4, fontFamily: token.fontFamily, fontWeight: 'bold' }]}>
        H4 - {token.fontSizeHeading4}px
      </Text>
      <Text style={[styles.heading, { fontSize: token.fontSizeHeading5, fontFamily: token.fontFamily, fontWeight: 'bold' }]}>
        H5 - {token.fontSizeHeading5}px
      </Text>
      <Text style={[styles.body, { fontSize: token.fontSizeXL, fontFamily: token.fontFamily }]}>
        Body XL - {token.fontSizeXL}px
      </Text>
      <Text style={[styles.body, { fontSize: token.fontSizeLG, fontFamily: token.fontFamily }]}>
        Body LG - {token.fontSizeLG}px
      </Text>
      <Text style={[styles.body, { fontSize: token.fontSize, fontFamily: token.fontFamily }]}>
        Body - {token.fontSize}px
      </Text>
      <Text style={[styles.body, { fontSize: token.fontSizeSM, fontFamily: token.fontFamily }]}>
        Body SM - {token.fontSizeSM}px
      </Text>
      <Text style={styles.familyTitle}>Font: {token.fontFamily}</Text>
    </Section>
  );
}
