import React from 'react';
import { Space, DateTimePicker } from '@pennyspring/ui';

const BASE_DATE = new Date(2026, 4, 9, 14, 30, 20);

export const dateTimePickerPrecisionDemoTitle = 'Precision';

export function DateTimePickerPrecisionDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
        <DateTimePicker
          precision="day"
          defaultValue={BASE_DATE}
          labelText="Select date"
          titleText="Date"
        />
        <DateTimePicker
          precision="minute"
          defaultValue={BASE_DATE}
          labelText="Select date and time"
          titleText="Date and time"
        />
        <DateTimePicker
          precision="second"
          secondStep={10}
          defaultValue={BASE_DATE}
          labelText="Select second precision"
          titleText="Second precision"
        />
        <DateTimePicker
          precision="minute"
          defaultValue={BASE_DATE}
          minuteStep={30}
          formatLabel={(value, params) =>
            params.type === 'minute'
              ? `${String(value).padStart(2, '0')}m`
              : String(value)
          }
          labelText="Custom format label"
          titleText="Format label"
        />
        <DateTimePicker
          precision="day"
          defaultValue={BASE_DATE}
          renderLabel={({ type, value }) =>
            `${type.slice(0, 1).toUpperCase()}${type.slice(1)}:${value}`
          }
          labelText="Custom render label"
          titleText="Render label"
        />
      </Space>
    </>
  );
}

export default DateTimePickerPrecisionDemo;
