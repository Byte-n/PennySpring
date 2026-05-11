import React from 'react';
import { View, Text } from 'react-native';
import { createUseSheetStyle } from '../createUseSheetStyle';
import { useTheme } from '../useTheme';
import type { AliasToken } from '../types';
import { Section } from './components/Section';
import { usePreviewStyles } from './styles';

const RADIUS_TOKENS = ['borderRadiusXS', 'borderRadiusSM', 'borderRadius', 'borderRadiusLG', 'borderRadiusOuter'];
const PREVIEW_BOX_WIDTH = 60;
const PREVIEW_BOX_HEIGHT = 40;

const useStyles = createUseSheetStyle(token => ({
  radiusSample: {
    width: PREVIEW_BOX_WIDTH,
    height: PREVIEW_BOX_HEIGHT,
    backgroundColor: token.colorPrimary,
  },
}));

export function BorderRadiusPreview() {
  const { token } = useTheme();
  const previewStyles = usePreviewStyles();
  const styles = useStyles();

  return (
    <Section title="Border Radius">
      {RADIUS_TOKENS.map(key => (
        <View key={key} style={previewStyles.radiusRow}>
          <View
            style={[
              styles.radiusSample,
              { borderRadius: token[key as keyof AliasToken] as number },
            ]}
          />
          <Text style={previewStyles.radiusLabel}>
            {key}: {token[key as keyof AliasToken] as number}px
          </Text>
        </View>
      ))}
    </Section>
  );
}
