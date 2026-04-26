import React from 'react';
import { View, Text } from 'react-native';
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

export function SpacingPreview() {
  const { token } = useTheme();
  const previewStyles = usePreviewStyles();

  return (
    <Section title="Spacing">
      {SPACING_TOKENS.map(([label, tokenKey]) => {
        const value = token[tokenKey as keyof typeof token] as number;
        return (
          <View key={label} style={previewStyles.spacingRow}>
            <Text style={previewStyles.spacingLabel}>{label}</Text>
            <View style={{ width: value * 4, height: 16, backgroundColor: token.colorPrimary }} />
            <Text style={previewStyles.spacingValue}>{value}px</Text>
          </View>
        );
      })}
    </Section>
  );
}
