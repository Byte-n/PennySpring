import React from 'react';
import { View, Text } from 'react-native';
import { createUseSheetStyle } from '../../createUseSheetStyle';

const useSwatchStyles = createUseSheetStyle(tokens => ({
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  swatchColor: {
    width: 40,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: tokens.colorBorder,
  },
  swatchLabel: {
    width: 180,
    fontSize: 12,
    fontFamily: 'monospace',
    color: tokens.colorText,
  },
  swatchValue: {
    fontSize: 12,
    color: tokens.colorTextSecondary,
    fontFamily: 'monospace',
  },
}));

interface SwatchProps {
  color: string;
  label: string;
}

export function Swatch({ color, label }: SwatchProps) {
  const styles = useSwatchStyles();
  return (
    <View style={styles.swatchRow}>
      <View style={[styles.swatchColor, { backgroundColor: color }]} />
      <Text style={styles.swatchLabel}>{label}</Text>
      <Text style={styles.swatchValue}>{color}</Text>
    </View>
  );
}
