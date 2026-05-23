import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { TextSize } from '@pennyspring/ui';

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

export const textSizeDemoTitle = 'Size';

export function TextSizeDemo() {
  const styles = useStyles();

  return (
    <>
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
    </>
  );
}

export default TextSizeDemo;
