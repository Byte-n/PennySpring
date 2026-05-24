import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { CalculatorInput, Input } from '@pennyspring/ui';

import { formatAmount, yuanToCents } from '../addRecordDraft';

interface MoneyFieldProps {
  labelText: string;
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

  return (
    <>
      <Pressable onPress={() => setPopupOpen(true)}>
        <Input
          label={labelText}
          placeholder={placeholder}
          readonly
          value={valueText}
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
