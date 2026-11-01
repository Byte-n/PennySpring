import React from 'react';
import { Button, Column, Empty, Text } from '@pennyspring/ui';

const SIZES = [
  { value: 'small', label: 'small · 36 底板 / 28 间距', action: '添加记录' },
  { value: 'normal', label: 'normal · 44 底板 / 32 留白', action: '新建模板' },
  { value: 'large', label: 'large · 52 底板 / 40 留白', action: '开始记账' },
] as const;

export function EmptySizeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ action, label, value }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">
            {label}
          </Text>
          <Empty
            size={value}
            titleText="还没有快捷模板"
            descriptionText="把常记的几笔存成模板，下次一键填好。"
            action={<Button size="small">{action}</Button>}
          />
        </Column>
      ))}
    </Column>
  );
}

export default EmptySizeDemo;
