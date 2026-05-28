import React from 'react';
import { View } from 'react-native';
import { Input, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const calculatorInputControlledDemoTitle = 'Controlled';

export function CalculatorInputControlledDemo() {
  const styles = useStyles();
  const [expression, setExpression] = React.useState('12+8/2');

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.status}>
          <Text color="description" size="sm">
            Expression: {expression || '-'}
          </Text>
        </View>
        <Input
          value={expression}
          onChange={setExpression}
          labelText="Controlled input"
        />
      </View>
    </>
  );
}

export default CalculatorInputControlledDemo;
