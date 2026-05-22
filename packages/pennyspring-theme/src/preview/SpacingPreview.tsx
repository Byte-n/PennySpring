import React from 'react';
import { View, Text } from 'react-native';
import { createUseSheetStyle } from '../createUseSheetStyle';
import { useTheme } from '../useTheme';
import { Section } from './components/Section';
import { usePreviewStyles } from './styles';

const SPACING_TOKENS = [
  ['paddingXXS', 'paddingXXS'],
  ['paddingXS', 'paddingXS'],
  ['paddingSM', 'paddingSM'],
  ['padding', 'padding'],
  ['paddingMD', 'paddingMD'],
  ['paddingLG', 'paddingLG'],
  ['paddingXL', 'paddingXL'],
] as const;

const SPACING_BAR_HEIGHT = 16;

const useStyles = createUseSheetStyle(token => ({
  spacingBar: {
    height: SPACING_BAR_HEIGHT,
    backgroundColor: token.colorPrimary,
  },
}));

export function SpacingPreview() {
  const { token } = useTheme();
  const previewStyles = usePreviewStyles();
  const styles = useStyles();

  return (
    <Section title="Spacing">
      {SPACING_TOKENS.map(([label, tokenKey]) => {
        const value = token[tokenKey as keyof typeof token] as number;
        return (
          <View key={label} style={previewStyles.spacingRow}>
            <Text style={previewStyles.spacingLabel}>{label}</Text>
            <View style={[styles.spacingBar, { width: value * 4 }]} />
            <Text style={previewStyles.spacingValue}>{value}px</Text>
          </View>
        );
      })}
    </Section>
  );
}
