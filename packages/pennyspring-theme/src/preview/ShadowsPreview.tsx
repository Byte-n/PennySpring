import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../useTheme';
import type { ShadowToken } from '../types';
import { Section } from './components/Section';
import { usePreviewStyles } from './styles';

const SHADOW_TOKENS = [
  ['boxShadow', 'boxShadow'],
  ['boxShadowSecondary', 'boxShadowSecondary'],
  ['boxShadowTertiary', 'boxShadowTertiary'],
] as const;

export function ShadowsPreview() {
  const { token } = useTheme();
  const previewStyles = usePreviewStyles();

  return (
    <Section title="Shadows">
      {SHADOW_TOKENS.map(([label, tokenKey]) => {
        const shadow = token[tokenKey as keyof typeof token] as ShadowToken;
        return (
          <View key={label} style={previewStyles.shadowBox}>
            <Text style={previewStyles.shadowLabel}>
              {label}
              {'\n'}
              blur={shadow.shadowRadius} offset=({shadow.shadowOffset.width},
              {shadow.shadowOffset.height}) opacity={shadow.shadowOpacity}{' '}
              elevation={shadow.elevation}
            </Text>
          </View>
        );
      })}
    </Section>
  );
}
