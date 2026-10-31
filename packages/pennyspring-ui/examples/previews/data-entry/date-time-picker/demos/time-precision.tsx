import React from 'react';
import { DateTimePicker, Space } from '@pennyspring/ui';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);

export function DateTimePickerTimePrecisionDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <DateTimePicker.Time
        precision="hour"
        defaultValue={BASE_TIME}
        labelText="Select hour"
        titleText="Hour"
      />
      <DateTimePicker.Time
        precision="minute"
        defaultValue={BASE_TIME}
        labelText="Select minute"
        titleText="Minute"
      />
      <DateTimePicker.Time
        precision="second"
        secondStep={10}
        defaultValue={BASE_TIME}
        labelText="Select second"
        titleText="Second"
      />
      <DateTimePicker.Time
        precision="minute"
        minuteStep={20}
        defaultValue={BASE_TIME}
        formatLabel={(value, params) =>
          params.type === 'minute'
            ? `${String(value).padStart(2, '0')}m`
            : String(value)
        }
        labelText="Custom format label"
        titleText="Format label"
      />
      <DateTimePicker.Time
        precision="hour"
        defaultValue={BASE_TIME}
        renderLabel={({ type, value }) => `${type}: ${value}`}
        labelText="Custom render label"
        titleText="Render label"
      />
    </Space>
  );
}

export default DateTimePickerTimePrecisionDemo;
