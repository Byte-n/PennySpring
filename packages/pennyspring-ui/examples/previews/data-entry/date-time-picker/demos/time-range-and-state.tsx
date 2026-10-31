import React from 'react';
import { DateTimePicker, Space } from '@pennyspring/ui';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);

const MIN_TIME = new Date(2026, 4, 9, 9, 0, 0);

const MAX_TIME = new Date(2026, 4, 9, 18, 0, 0);

export function DateTimePickerTimeRangeAndStateDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <DateTimePicker.Time
        precision="minute"
        minuteStep={15}
        min={MIN_TIME}
        max={MAX_TIME}
        defaultValue={BASE_TIME}
        labelText="Business hours"
        titleText="Business hours"
      />
      <DateTimePicker.Time
        disabled
        defaultValue={BASE_TIME}
        labelText="Not selectable"
        titleText="Disabled"
      />
      <DateTimePicker.Time
        loading
        loadingIndicatorText="Loading time ranges"
        emptyText="No available time"
        labelText="Loading state"
        titleText="Loading and empty"
      />
      <DateTimePicker.Time
        okDisabled
        defaultValue={BASE_TIME}
        labelText="Cannot confirm"
        titleText="Ok disabled"
      />
    </Space>
  );
}

export default DateTimePickerTimeRangeAndStateDemo;
