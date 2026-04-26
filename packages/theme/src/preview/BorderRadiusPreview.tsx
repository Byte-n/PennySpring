import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../useTheme';
import type { AliasToken } from '../types';
import { Section } from './components/Section';
import { usePreviewStyles } from './styles';

const RADIUS_TOKENS = ['borderRadiusXS', 'borderRadiusSM', 'borderRadius', 'borderRadiusLG', 'borderRadiusOuter'];

export function BorderRadiusPreview() {
  const { token } = useTheme();
  const previewStyles = usePreviewStyles();

  return (
    <Section title="Border Radius">
      {RADIUS_TOKENS.map(key => (
        <View key={key} style={previewStyles.radiusRow}>
          <View
            style={{
              width: 60,
              height: 40,
              backgroundColor: token.colorPrimary,
              borderRadius: token[key as keyof AliasToken] as number,
            }}
          />
          <Text style={previewStyles.radiusLabel}>
            {key}: {token[key as keyof AliasToken] as number}px
          </Text>
        </View>
      ))}
    </Section>
  );
}
