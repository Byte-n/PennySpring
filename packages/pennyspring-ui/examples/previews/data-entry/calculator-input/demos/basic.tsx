import React from 'react';
import { View } from 'react-native';
import { CalculatorInput } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function CalculatorInputBasicDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <CalculatorInput defaultValue="1+2×3" />
      <CalculatorInput defaultValue="16/" />
    </View>
  );
}

export default CalculatorInputBasicDemo;
