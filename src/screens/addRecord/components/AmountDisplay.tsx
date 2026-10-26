import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, CalculatorInput, Column } from '@pennyspring/ui';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/theme';
import { useAddRecordContext } from '../AddRecordContext';
import { yuanToCents } from '../addRecordDraft';

const useStyles = createUseSheetStyle(token => ({
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    ...toShadowStyle(token.boxShadowTertiary),
    paddingHorizontal: token.paddingLG,
    paddingVertical: token.paddingLG,
    marginVertical: token.paddingXS,
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
        style={styles.card}
        onPress={() => setPopupOpen(true)}
      >
        <Column align="center">
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
