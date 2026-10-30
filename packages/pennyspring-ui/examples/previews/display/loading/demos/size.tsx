import React from 'react';
import { Column, Loading, Text } from '@pennyspring/ui';

const SIZES = [
  { value: 'small', label: 'small · 16 转圈' },
  { value: 'normal', label: 'normal · 20 转圈' },
  { value: 'large', label: 'large · 28 转圈' },
] as const;

export function LoadingSizeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ label, value }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">{label}</Text>
          <Loading size={value} text="正在加载" />
        </Column>
      ))}
    </Column>
  );
}

export default LoadingSizeDemo;
