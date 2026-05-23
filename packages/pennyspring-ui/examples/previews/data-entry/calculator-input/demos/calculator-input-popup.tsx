import React from 'react';
import { View } from 'react-native';
import { CalculatorInput, Input } from '@pennyspring/ui';
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
  'CalculatorInput.Popup';

export function CalculatorInputCalculatorInputPopupDemo() {
  const styles = useStyles();
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [popupValue, setPopupValue] = React.useState('30/5+2');
  const [popupDisplayValue, setPopupDisplayValue] = React.useState('');

  return (
    <>
      <View style={styles.stack}>
        <Input
          readonly
          showSoftInputOnFocus={false}
          label="Tap to open calculator"
          placeholder="Select calculated value"
          value={popupDisplayValue}
          onFocus={() => {
            setPopupOpen(true);
          }}
        />
        <CalculatorInput.Popup
          open={popupOpen}
          value={popupValue}
          onChange={setPopupValue}
          onOk={params => {
            setPopupDisplayValue(String(params.result));
          }}
          onOpenChange={setPopupOpen}
        />
      </View>
    </>
  );
}

export default CalculatorInputCalculatorInputPopupDemo;
