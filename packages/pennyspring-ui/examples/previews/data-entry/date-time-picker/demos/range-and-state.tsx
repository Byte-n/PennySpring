import React from 'react';
import { Space, DateTimePicker } from '@pennyspring/ui';

const BASE_DATE = new Date(2026, 4, 9, 14, 30, 20);

const MIN_DATE = new Date(2026, 0, 1, 0, 0, 0);

const MAX_DATE = new Date(2026, 11, 31, 23, 59, 59);

export function DateTimePickerRangeAndStateDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
        <DateTimePicker
          precision="month"
          min={MIN_DATE}
          max={MAX_DATE}
          defaultValue={BASE_DATE}
          labelText="Select month"
          titleText="Month in 2026"
        />
        <DateTimePicker
          disabled
          defaultValue={BASE_DATE}
          labelText="Not selectable"
          titleText="Disabled"
        />
        <DateTimePicker
          loading
          loadingIndicatorText="Loading available dates"
          emptyText="No available date"
          labelText="Loading state"
          titleText="Loading and empty"
        />
        <DateTimePicker
          okDisabled
          defaultValue={BASE_DATE}
          labelText="Cannot confirm"
          titleText="Ok disabled"
        />
      </Space>
    </>
  );
}

export default DateTimePickerRangeAndStateDemo;
