import React, { useState } from 'react';
import { Space, Text, WheelGroup } from '@pennyspring/ui';
import type { WheelGroupColumn, WheelGroupValue } from '@pennyspring/ui';

function padValue(value: number): string {
  return String(value).padStart(2, '0');
}

function buildNumberColumn(count: number): WheelGroupColumn {
  return Array.from({ length: count }, (_, index) => ({
    labelText: padValue(index),
    value: index,
  }));
}

const HOURS = buildNumberColumn(24);
const MINUTES = buildNumberColumn(60);
const SECONDS = buildNumberColumn(60);

export function WheelGroupBasicDemo() {
  const [value, setValue] = useState<WheelGroupValue[]>([14, 30, 15]);
  const valueText = value.map(item => padValue(Number(item))).join(':');

  return (
    <Space block direction="vertical" size="large">
      <WheelGroup
        columns={[HOURS, MINUTES, SECONDS]}
        value={value}
        onChange={nextValue => setValue(nextValue)}
      />
      <Text color="description" size="sm">
        Selected {valueText}
      </Text>
    </Space>
  );
}

export default WheelGroupBasicDemo;
