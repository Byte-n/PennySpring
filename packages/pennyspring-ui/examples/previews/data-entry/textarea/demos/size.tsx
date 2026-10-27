import React from 'react';
import { Column, Text, Textarea } from '@pennyspring/ui';

export const textareaSizeDemoTitle = '尺寸（size）';

const SIZES = [
  { value: 'small', label: 'small · 14/24，3 行 88' },
  { value: 'normal', label: 'normal · 16/26，3 行 94' },
  { value: 'large', label: 'large · 18/28，3 行 100' },
] as const;

export function TextareaSizeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ label, value }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">{label}</Text>
          <Textarea labelText="备注" placeholder="写点什么" size={value} />
        </Column>
      ))}
    </Column>
  );
}

export default TextareaSizeDemo;
