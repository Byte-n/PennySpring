import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, CalculatorInput, Column } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useAddRecordContext } from '../AddRecordContext';
import { yuanToCents } from '../addRecordDraft';

const VERTICAL_DIVISOR = 2;

const useStyles = createUseSheetStyle(token => ({
  card: {
    backgroundColor: token.colorBgLayout,
    paddingHorizontal: token.paddingLG,
    marginVertical: token.paddingLG / VERTICAL_DIVISOR,
    borderBottomColor: token.colorPrimary,
    borderBottomWidth: 2,
    borderStyle: 'solid',
  },
}));

interface AmountDisplayProps {
  labelText: string;
}

export function AmountDisplay({ labelText }: AmountDisplayProps) {
  const { amount, setAmount } = useAddRecordContext();
  const [popupOpen, setPopupOpen] = useState(false);
  const styles = useStyles();

  const displayText = `¥ ${(amount / 100).toFixed(2)}`;

  return (
    <>
      <Pressable
        testID="amount-pressable"
        style={styles.card}
        onPress={() => setPopupOpen(true)}
      >
        <Column align="center">
          <Text color="primary" size="sm">
            {labelText}
          </Text>
          <Text testID="amount-text" color="primary" size="h1">
            {displayText}
          </Text>
        </Column>
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
