import React from 'react';
import { Space, Text, WheelGroup } from '@pennyspring/ui';
import type { WheelGroupColumn } from '@pennyspring/ui';

function padValue(value: number): string {
  return String(value).padStart(2, '0');
}

const HOURS: WheelGroupColumn = Array.from({ length: 24 }, (_, index) => ({
  labelText: padValue(index),
  value: index,
}));

const MINUTES_WITH_DISABLED: WheelGroupColumn = Array.from(
  { length: 60 },
  (_, index) => ({
    labelText: padValue(index),
    value: index,
    disabled: index === 30 || index === 45,
  }),
);

export function WheelGroupStateDemo() {
  return (
    <Space block direction="vertical" gap="large">
      <WheelGroup
        columns={[HOURS, MINUTES_WITH_DISABLED]}
        defaultValue={[9, 0]}
      />
      <Text color="description" size="sm">
        Minutes 30 and 45 are disabled but still scrollable
      </Text>
      <WheelGroup columns={[HOURS]} defaultValue={[10]} disabled />
      <Text color="description" size="sm">
        Whole wheel group disabled
      </Text>
    </Space>
  );
}

export default WheelGroupStateDemo;
