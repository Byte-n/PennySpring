import React from 'react';
import { Space, TimePicker } from '@pennyspring/ui';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);

export const timePickerPrecisionDemoTitle = 'Precision';

export function TimePickerPrecisionDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
        <TimePicker
          precision="hour"
          defaultValue={BASE_TIME}
          placeholder="Select hour"
          titleText="Hour"
        />
        <TimePicker
          precision="minute"
          defaultValue={BASE_TIME}
          placeholder="Select minute"
          titleText="Minute"
        />
        <TimePicker
          precision="second"
          secondStep={10}
          defaultValue={BASE_TIME}
          placeholder="Select second"
          titleText="Second"
        />
        <TimePicker
          precision="minute"
          minuteStep={20}
          defaultValue={BASE_TIME}
          formatLabel={(value, params) =>
            params.type === 'minute'
              ? `${String(value).padStart(2, '0')}m`
              : String(value)
          }
          placeholder="Custom format label"
          titleText="Format label"
        />
        <TimePicker
          precision="hour"
          defaultValue={BASE_TIME}
          renderLabel={({ type, value }) => `${type}: ${value}`}
          placeholder="Custom render label"
          titleText="Render label"
        />
      </Space>
    </>
  );
}

export default TimePickerPrecisionDemo;
