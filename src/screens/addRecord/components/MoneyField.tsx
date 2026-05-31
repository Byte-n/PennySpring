import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { CalculatorInput, Input } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

import { formatAmount, yuanToCents } from '../addRecordDraft';

const MONEY_FIELD_WIDTH = 100;

const useStyles = createUseSheetStyle(() => ({
  input: { width: MONEY_FIELD_WIDTH },
}));

interface MoneyFieldProps {
  labelText?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export function MoneyField({
  labelText,
  onChange,
  placeholder = '请选择金额',
  value,
}: MoneyFieldProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const valueText = value > 0 ? `¥ ${formatAmount(value)}` : '';
  const styles = useStyles();

  return (
    <>
      <Pressable onPress={() => setPopupOpen(true)}>
        <Input
          labelText={labelText}
          placeholder={placeholder}
          readonly
          value={valueText}
          style={styles.input}
        />
      </Pressable>
      <CalculatorInput.Popup
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onOk={params => {
          onChange(yuanToCents(params.result));
          setPopupOpen(false);
        }}
      />
    </>
  );
}
