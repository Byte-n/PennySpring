import React from 'react';
import { View } from 'react-native';
import { Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export const calculatorInputCalculatorInputPopupDemoTitle =
  'Input';

export function CalculatorInputCalculatorInputPopupDemo() {
  const styles = useStyles();
  const [popupDisplayValue, setPopupDisplayValue] = React.useState('30/5+2');

  return (
    <>
      <View style={styles.stack}>
        <Input
          labelText="Input"
          placeholder="Type expression"
          value={popupDisplayValue}
          onChange={setPopupDisplayValue}
        />
      </View>
    </>
  );
}

export default CalculatorInputCalculatorInputPopupDemo;
