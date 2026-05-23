import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { TextWeight } from '@pennyspring/ui';

const WEIGHTS: TextWeight[] = [
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'strong',
];

const useStyles = createUseSheetStyle(token => ({
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

export const textWeightDemoTitle = 'Weight';

export function TextWeightDemo() {
  const styles = useStyles();

  return (
    <>
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
    </>
  );
}

export default TextWeightDemo;
