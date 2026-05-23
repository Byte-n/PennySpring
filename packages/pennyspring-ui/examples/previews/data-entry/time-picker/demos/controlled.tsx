import React from 'react';
import { Space, TimePicker, Text } from '@pennyspring/ui';

const BASE_TIME = new Date(2026, 4, 9, 14, 30, 20);

const MIN_TIME = new Date(2026, 4, 9, 9, 0, 0);

const MAX_TIME = new Date(2026, 4, 9, 18, 0, 0);

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export const timePickerControlledDemoTitle = 'Controlled';

export function TimePickerControlledDemo() {
  const [controlledTime, setControlledTime] = React.useState(BASE_TIME);

  return (
    <>
      <Space block direction="vertical" size="large">
        <TimePicker
          precision="minute"
          minuteStep={15}
          min={MIN_TIME}
          max={MAX_TIME}
          value={controlledTime}
          onChange={setControlledTime}
          placeholder="Select time"
          titleText="Controlled time"
        />
        <Text color="description" size="sm">
          Current: {formatTime(controlledTime)}
        </Text>
      </Space>
    </>
  );
}

export default TimePickerControlledDemo;
