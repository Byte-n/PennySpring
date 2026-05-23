import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { CalculatorInputOkParams } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

function formatOkParams(params: CalculatorInputOkParams | null): string {
  if (params === null) {
    return '-';
  }

  return `${params.expression} = ${params.result}`;
}

export const calculatorInputControlledDemoTitle = 'Controlled';

export function CalculatorInputControlledDemo() {
  const styles = useStyles();
  const [expression, setExpression] = React.useState('12+8/2');
  const [okParams, setOkParams] =
    React.useState<CalculatorInputOkParams | null>(null);

  return (
    <>
      <View style={styles.stack}>
        <View style={styles.status}>
          <Text color="description" size="sm">
            Expression: {expression || '-'}
          </Text>
          <Text color="description" size="sm">
            Confirmed: {formatOkParams(okParams)}
          </Text>
        </View>
        <CalculatorInput
          value={expression}
          onChange={setExpression}
          onOk={setOkParams}
        />
      </View>
    </>
  );
}

export default CalculatorInputControlledDemo;
