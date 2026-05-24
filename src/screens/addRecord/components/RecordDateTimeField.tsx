import React from 'react';
import { DateTimePicker, Input } from '@pennyspring/ui';

interface RecordDateTimeFieldProps {
  value: number;
  onChange: (value: number) => void;
}

function formatDateTime(time: number): string {
  return new Date(time).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
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
    >
      <Input label="记账时间" readonly value={formatDateTime(value)} />
    </DateTimePicker>
  );
}
