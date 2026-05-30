import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, CalculatorInput, Column } from '@pennyspring/ui';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { useAddRecordContext } from '../AddRecordContext';
import { yuanToCents } from '../addRecordDraft';

const VERTICAL_DIVISOR = 2;

const useStyles = createUseSheetStyle(token => ({
  card: {
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusLG,
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingLG / VERTICAL_DIVISOR,
    ...toShadowStyle(token.boxShadowTertiary),
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
          <Text color="lightSolid" size="sm">
            {labelText}
          </Text>
          <Text testID="amount-text" color="lightSolid" size="h1">
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
