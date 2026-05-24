import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, CalculatorInput } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useAddRecordContext } from '../AddRecordContext';
import { yuanToCents } from '../addRecordDraft';

const useStyles = createUseSheetStyle(() => ({
  pressable: {
    alignItems: 'center' as const,
  },
}));

export function AmountDisplay() {
  const { amount, setAmount } = useAddRecordContext();
  const [popupOpen, setPopupOpen] = useState(false);
  const styles = useStyles();

  const displayText = `¥ ${(amount / 100).toFixed(2)}`;

  return (
    <>
      <Pressable
        testID="amount-pressable"
        style={styles.pressable}
        onPress={() => setPopupOpen(true)}
      >
        <Text testID="amount-text" size={'h1'}>
          {displayText}
        </Text>
      </Pressable>
      <CalculatorInput.Popup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onOk={params => {
          setAmount(yuanToCents(params.result));
          setPopupOpen(false);
        }}
      />
    </>
  );
}
