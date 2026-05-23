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

export const calculatorInputStateDemoTitle = 'State';

export function CalculatorInputStateDemo() {
  const styles = useStyles();

  return (
    <>
      <View style={styles.stack}>
        <Text color="description" size="sm">
          disabled
        </Text>
        <CalculatorInput disabled defaultValue="100+20" />
        <Text color="description" size="sm">
          readonly
        </Text>
        <CalculatorInput readonly defaultValue="88/4" />
      </View>
    </>
  );
}

export default CalculatorInputStateDemo;
