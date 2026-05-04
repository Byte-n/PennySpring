import React from 'react';
import { Animated, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from './Text';
import type { TextColor, TextSize, TextWeight } from './types';
import ScrollView = Animated.ScrollView;

const SIZES: TextSize[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'xl',
  'lg',
  'md',
  'sm',
];

const COLORS: TextColor[] = [
  'base',
  'default',
  'secondary',
  'tertiary',
  'quaternary',
  'heading',
  'label',
  'description',
  'disabled',
  'placeholder',
  'lightSolid',
];

const WEIGHTS: TextWeight[] = [
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'strong',
];

const useStyles = createUseSheetStyle(token => ({
  content: {
    padding: token.padding,
    gap: token.paddingXS,
  },
  section: {
    gap: token.paddingXS,
  },
  sectionTitle: {
    marginTop: token.marginXS,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: token.paddingSM,
    backgroundColor: token.colorBgContainer,
  },
  label: {
    fontSize: token.fontSizeSM,
    width: token.controlHeightLG,
  },
  wideLabel: {
    fontSize: token.fontSizeSM,
    width: token.controlHeightLG + token.controlHeightLG,
  },
  lightSolidRow: {
    backgroundColor: token.colorBgSpotlight,
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: token.paddingXS,
  },
  rightText: {
    flexShrink: 1,
  },
}));

export function TextPreview() {
  const styles = useStyles();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text size="h5" weight="strong">
          Size
        </Text>
        {SIZES.map(size => (
          <View key={size} style={styles.row}>
            <Text size="sm" style={styles.label}>
              {size}
            </Text>
            <Text size={size} style={styles.rightText}>
              PennySpring 你好
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text size="h5" weight="strong" style={styles.sectionTitle}>
          Color
        </Text>
        {COLORS.map(color => (
          <View
            key={color}
            style={[styles.row, color === 'lightSolid' && styles.lightSolidRow]}
          >
            <Text size="sm" color={color} style={styles.wideLabel}>
              {color}
            </Text>
            <Text size="md" color={color} style={styles.rightText}>
              PennySpring 你好
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text size="h5" weight="strong" style={styles.sectionTitle}>
          Weight
        </Text>
        {WEIGHTS.map(weight => (
          <View key={weight} style={styles.row}>
            <Text size="sm" weight={weight} style={styles.wideLabel}>
              {weight}
            </Text>
            <Text size="md" weight={weight} style={styles.rightText}>
              PennySpring 你好
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
