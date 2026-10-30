import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, DisplayInput } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
}));

export function CalculatorInputCalculatorInputPopupDemo() {
  const styles = useStyles();
  const [amount, setAmount] = React.useState<number | null>(null);
  const calculator = CalculatorInput.useCalculatorValueState({
    initialValue: amount === null ? '' : String(amount),
    onOk: params => {
      setAmount(params.result);
    },
  });

  return (
    <View style={styles.stack}>
      <DisplayInput
        labelText="金额"
        onPress={calculator.open}
        readonly
        valueText={amount === null ? '—' : `¥ ${amount.toFixed(2)}`}
      />
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

export default CalculatorInputCalculatorInputPopupDemo;
