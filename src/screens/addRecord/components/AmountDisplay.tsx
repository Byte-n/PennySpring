import React, { useEffect, useRef } from 'react';
import { Pressable } from 'react-native';
import { Text, CalculatorInput, Column } from '@pennyspring/ui';
import { createUseSheetStyle, toShadowStyle } from '@pennyspring/ui';
import { useAddRecordContext } from '../AddRecordContext';
import { formatCentsAsExpression, yuanToCents } from '../addRecordDraft';

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
  const { amount, consumeAutoOpenAmount, setAmount } = useAddRecordContext();
  const {
    isOpen,
    value,
    open,
    setOpen,
    setValue,
    handleOk,
  } = CalculatorInput.useCalculatorValueState({
    initialValue: formatCentsAsExpression(amount),
    onOk: params => {
      setAmount(yuanToCents(params.result));
    },
  });
  const styles = useStyles();
  const autoOpenHandledRef = useRef(false);

  useEffect(() => {
    if (autoOpenHandledRef.current) {
      return;
    }

    autoOpenHandledRef.current = true;
    if (consumeAutoOpenAmount()) {
      open();
    }
  }, [consumeAutoOpenAmount, open]);

  const displayText = `¥ ${(amount / 100).toFixed(2)}`;

  return (
    <>
      <Pressable
        testID="amount-pressable"
        style={styles.card}
        onPress={open}
      >
        <Column align="center">
          <Text testID="amount-text" color="primary" size="h1">
            {displayText}
          </Text>
        </Column>
      </Pressable>
      <CalculatorInput.Popup
        open={isOpen}
        onOpenChange={setOpen}
        onChange={setValue}
        onOk={handleOk}
        value={value}
      />
    </>
  );
}
