import React from 'react';
import { Checkbox, Column, Text } from '@pennyspring/ui';

export const checkboxSizeDemoTitle = '尺寸（size）';

const SIZES = [
  { hint: 'small · 框 16 / 圆角 4 / 勾 12 / 行高 37.4', value: 'small' },
  { hint: 'normal · 框 20 / 圆角 6 / 勾 14 / 行高 44', value: 'normal' },
  { hint: 'large · 框 24 / 圆角 8 / 勾 16 / 行高 50.6', value: 'large' },
] as const;

export function CheckboxSizeDemo() {
  return (
    <Column gap="normal">
      {SIZES.map(({ hint, value }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">{hint}</Text>
          <Checkbox size={value}>同一张卡连续记账</Checkbox>
          <Checkbox defaultValue size={value}>自动匹配历史分类</Checkbox>
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        small 用于卡片内紧凑多选，large 只用于设置页或一次性确认
      </Text>
    </Column>
  );
}

export default CheckboxSizeDemo;
