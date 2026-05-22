import React from 'react';
import { View, Text } from 'react-native';
import { createUseSheetStyle } from '../createUseSheetStyle';
import { useTheme } from '../useTheme';
import { Section } from './components/Section';
import type { AliasToken } from '../types';

const useColorPaletteStyles = createUseSheetStyle((tokens) => ({
  colorGroup: {
    marginBottom: 16,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
    color: tokens.colorText,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 4,
  },
  colorBlock: {
    flex: 1,
    height: 32,
    borderRadius: 4,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  stepLabel: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'monospace',
    color: tokens.colorTextSecondary,
  },
}));

const PRESET_COLORS = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold',
] as const;

const COLOR_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function ColorPalettePreview() {
  const { token } = useTheme();
  const styles = useColorPaletteStyles();

  return (
    <Section title="Color Palette">
      {PRESET_COLORS.map(colorName => (
        <View key={colorName} style={styles.colorGroup}>
          <Text style={styles.colorName}>{colorName}</Text>
          <View style={styles.paletteRow}>
            {COLOR_STEPS.map(step => {
              const tokenName = `${colorName}${step}` as keyof AliasToken;
              const color = token[tokenName] as string;
              return (
                <View
                  key={step}
                  style={[styles.colorBlock, { backgroundColor: color }]}
                />
              );
            })}
          </View>
          <View style={styles.labelRow}>
            {COLOR_STEPS.map(step => (
              <Text key={step} style={styles.stepLabel}>
                {step}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </Section>
  );
}
