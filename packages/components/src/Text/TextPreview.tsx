import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from './Text';
import type { TextSize } from './types';

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

const useStyles = createUseSheetStyle(token => ({
  container: {
    padding: token.padding,
    gap: token.paddingXS,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: token.paddingSM,
    backgroundColor: token.colorBgContainer,
  },
  label: {
    fontSize: token.fontSizeSM,
    width: 32,
  },
  rightText: {
    flexShrink: 1,
  },
}));

export function TextPreview() {
  const styles = useStyles();

  return (
    <View style={styles.container}>
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
  );
}
