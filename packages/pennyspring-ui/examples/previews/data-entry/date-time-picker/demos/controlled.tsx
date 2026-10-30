import React from 'react';
import { Space, DateTimePicker, Text } from '@pennyspring/ui';

const BASE_DATE = new Date(2026, 4, 9, 14, 30, 20);

const MIN_DATE = new Date(2026, 0, 1, 0, 0, 0);

const MAX_DATE = new Date(2026, 11, 31, 23, 59, 59);

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function DateTimePickerControlledDemo() {
  const [controlledDate, setControlledDate] = React.useState(BASE_DATE);

  return (
    <>
      <Space block direction="vertical" size="large">
        <DateTimePicker
          precision="minute"
          value={controlledDate}
          min={MIN_DATE}
          max={MAX_DATE}
          minuteStep={15}
          onChange={setControlledDate}
          labelText="Select date and time"
          titleText="Controlled date time"
        />
        <Text color="description" size="sm">
          Current: {formatDateTime(controlledDate)}
        </Text>
      </Space>
    </>
  );
}

export default DateTimePickerControlledDemo;
