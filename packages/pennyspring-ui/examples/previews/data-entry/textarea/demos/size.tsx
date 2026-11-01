import React from 'react';
import { Column, Text, Textarea } from '@pennyspring/ui';

const SIZES = [
  {
    value: 'small',
    label: 'small · 14/24，3 行 98',
    text: '地铁通勤，单程 4 元。',
  },
  {
    value: 'normal',
    label: 'normal · 16/26，3 行 107',
    text: '十月份聚餐分摊：人均 64 元，共 6 人。',
  },
  {
    value: 'large',
    label: 'large · 18/28，3 行 116',
    text: '十月房租，含物业费与停车费。',
  },
] as const;

export function TextareaSizeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ label, value, text }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">
            {label}
          </Text>
          <Textarea defaultValue={text} labelText="备注" size={value} />
        </Column>
      ))}
    </Column>
  );
}

export default TextareaSizeDemo;
