import React from 'react';
import { DateTimePicker, Space } from '@pennyspring/ui';

const BASE_DATE = new Date(2026, 9, 25, 14, 30, 15);

export function DateTimePickerCalendarLayoutDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <DateTimePicker
        layout="calendar"
        precision="day"
        defaultValue={BASE_DATE}
        labelText="Select date"
        titleText="Date"
      />
      <DateTimePicker
        layout="calendar"
        precision="minute"
        defaultValue={BASE_DATE}
        labelText="Select date and time"
        titleText="Date and time"
      />
      <DateTimePicker
        layout="calendar"
        precision="second"
        defaultValue={BASE_DATE}
        labelText="Select second precision"
        titleText="Second precision"
      />
    </Space>
  );
}

export default DateTimePickerCalendarLayoutDemo;
