import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, DisplayInput, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const CENTS_PER_YUAN = 100;
const INITIAL_AMOUNT = 1200;

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

function formatCents(cents: number): string {
  return (cents / CENTS_PER_YUAN).toFixed(2);
}

function formatExpression(cents: number): string {
  if (cents <= 0) {
    return '';
  }

  return formatCents(cents).replace(/0+$/, '').replace(/\.$/, '');
}

export function CalculatorInputControlledDemo() {
  const styles = useStyles();
  const [amount, setAmount] = React.useState(INITIAL_AMOUNT);
  const calculator = CalculatorInput.useCalculatorValueState({
    initialValue: formatExpression(amount),
    onOk: params => {
      setAmount(Math.round(params.result * CENTS_PER_YUAN));
    },
  });

  return (
    <View style={styles.stack}>
      <DisplayInput
        labelText="金额"
        onPress={calculator.open}
        readonly
        valueText={`¥ ${formatCents(amount)}`}
      />
      <View style={styles.status}>
        <Text color="description" size="sm">
          表达式：{calculator.value || '-'}
        </Text>
      </View>
      <CalculatorInput.Popup
        onChange={calculator.setValue}
        onOk={calculator.handleOk}
        onOpenChange={calculator.setOpen}
        open={calculator.isOpen}
        value={calculator.value}
      />
    </View>
  );
}

export default CalculatorInputControlledDemo;
