import React from 'react';
import { DateTimePicker } from '@pennyspring/ui';

interface RecordDateTimeFieldProps {
  value: number;
  onChange: (value: number) => void;
}

export function RecordDateTimeField({
  onChange,
  value,
}: RecordDateTimeFieldProps) {
  return (
    <DateTimePicker
      precision="minute"
      titleText="选择记账时间"
      value={new Date(value)}
      onOk={date => onChange(date.getTime())}
    />
  );
}
