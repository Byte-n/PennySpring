import React from 'react';
import { View } from 'react-native';
import { Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { TextColor } from '@pennyspring/ui';

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
const ALIAS_COLORS: TextColor[] = ['colorPrimary', 'colorSuccessText', 'colorWarningText'];

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

export const textColorDemoTitle = 'Color';

export function TextColorDemo() {
  const styles = useStyles();

  return (
    <>
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
      {ALIAS_COLORS.map(color => (
        <View key={color} style={styles.row}>
          <Text size="sm" color={color} style={styles.wideLabel}>
            {color}
          </Text>
          <Text size="md" color={color} style={styles.rightText}>
            Alias token color
          </Text>
        </View>
      ))}
    </>
  );
}

export default TextColorDemo;
