import React from 'react';
import { DateTimePicker, Space } from '@pennyspring/ui';

const BASE_DATE = new Date(2026, 9, 25);

export function DateTimePickerDateDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <DateTimePicker.Date
        layout="calendar"
        defaultValue={BASE_DATE}
        labelText="Select date with calendar"
        titleText="Calendar layout"
      />
      <DateTimePicker.Date
        layout="wheel"
        defaultValue={BASE_DATE}
        labelText="Select date with wheel"
        titleText="Wheel layout"
      />
      <DateTimePicker.Date
        layout="wheel"
        precision="month"
        defaultValue={BASE_DATE}
        labelText="Select month"
        titleText="Month precision"
      />
    </Space>
  );
}

export default DateTimePickerDateDemo;
