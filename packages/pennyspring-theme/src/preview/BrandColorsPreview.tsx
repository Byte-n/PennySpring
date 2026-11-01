import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../useTheme';
import type { AliasToken } from '../types';
import { Section } from './components/Section';
import { Swatch } from './components/Swatch';
import { usePreviewStyles } from './styles';

const BRAND_COLORS = [
  'colorPrimary',
  'colorSuccess',
  'colorWarning',
  'colorError',
  'colorInfo',
] as const;

const BRAND_STEPS = [
  'Bg',
  'BgHover',
  'Border',
  'BorderHover',
  'Hover',
  '',
  'Active',
  'TextHover',
  'Text',
  'TextActive',
];

export function BrandColorsPreview() {
  const { token } = useTheme();
  const previewStyles = usePreviewStyles();

  return (
    <Section title="Brand Colors">
      {BRAND_COLORS.map(colorKey => (
        <View key={colorKey} style={previewStyles.familyGroup}>
          <Text style={previewStyles.familyTitle}>{colorKey}</Text>
          {BRAND_STEPS.map(step => {
            const tokenName = `${colorKey}${step}` as keyof AliasToken;
            const value = token[tokenName] as string;
            return (
              <Swatch
                key={tokenName}
                color={value || '#000'}
                label={tokenName}
              />
            );
          })}
        </View>
      ))}
    </Section>
  );
}
