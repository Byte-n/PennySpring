import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function CalculatorInputStateDemo() {
  const styles = useStyles();

  return (
    <View style={styles.stack}>
      <View style={styles.status}>
        <Text color="description" size="sm">
          disabled
        </Text>
      </View>
      <CalculatorInput disabled defaultValue="100+20" />
      <View style={styles.status}>
        <Text color="description" size="sm">
          readonly
        </Text>
      </View>
      <CalculatorInput readonly defaultValue="88/4" />
    </View>
  );
}

export default CalculatorInputStateDemo;
