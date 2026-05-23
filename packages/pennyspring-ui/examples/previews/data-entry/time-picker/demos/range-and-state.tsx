import React from 'react';
import { Space, TimePicker } from '@pennyspring/ui';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);

const MIN_TIME = new Date(2026, 4, 9, 9, 0, 0);

const MAX_TIME = new Date(2026, 4, 9, 18, 0, 0);

export const timePickerRangeAndStateDemoTitle = 'Range and state';

export function TimePickerRangeAndStateDemo() {
  return (
    <>
      <Space block direction="vertical" size="large">
        <TimePicker
          precision="minute"
          minuteStep={15}
          min={MIN_TIME}
          max={MAX_TIME}
          defaultValue={BASE_TIME}
          placeholder="Business hours"
          titleText="Business hours"
        />
        <TimePicker
          disabled
          defaultValue={BASE_TIME}
          placeholder="Not selectable"
          titleText="Disabled"
        />
        <TimePicker
          loading
          loadingIndicatorText="Loading time ranges"
          emptyText="No available time"
          placeholder="Loading state"
          titleText="Loading and empty"
        />
        <TimePicker
          okDisabled
          defaultValue={BASE_TIME}
          placeholder="Cannot confirm"
          titleText="Ok disabled"
        />
      </Space>
    </>
  );
}

export default TimePickerRangeAndStateDemo;
