import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Column, Text, CalculatorInput } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useAddRecordContext } from '../AddRecordContext';

const useStyles = createUseSheetStyle((token) => ({
  pressable: {
    paddingVertical: token.paddingLG,
    alignItems: 'center' as const,
  },
  amount: {
    fontSize: token.fontSizeHeading1,
  },
}));

export function AmountDisplay() {
  const { amount, setAmount } = useAddRecordContext();
  const [popupOpen, setPopupOpen] = useState(false);
  const styles = useStyles();

  const displayText = `¥ ${(amount / 100).toFixed(2)}`;

  return (
    <Column>
      <Pressable testID="amount-pressable" style={styles.pressable} onPress={() => setPopupOpen(true)}>
        <Text testID="amount-text" style={styles.amount}>{displayText}</Text>
      </Pressable>
      <CalculatorInput.Popup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onOk={(params) => {
          setAmount(Math.round(params.result * 100));
          setPopupOpen(false);
        }}
      />
    </Column>
  );
}
