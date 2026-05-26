import React from 'react';
import { DateTimePicker } from '@pennyspring/ui';

interface RecordDateTimeFieldProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}

export function RecordDateTimeField({
  onChange,
  placeholder,
  value,
}: RecordDateTimeFieldProps) {
  return (
    <DateTimePicker
      placeholder={placeholder}
      precision="minute"
      titleText="选择记账时间"
      value={new Date(value)}
      onOk={date => onChange(date.getTime())}
    />
  );
}
