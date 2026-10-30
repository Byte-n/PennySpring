import React from 'react';
import { Checkbox, Column, Row, Text } from '@pennyspring/ui';
import type { CheckboxGroupOption, CheckboxValue } from '@pennyspring/ui';

const CATEGORY_OPTIONS: CheckboxGroupOption[] = [
  { label: '餐饮', value: 'food' },
  { label: '交通', value: 'traffic' },
  { label: '房租', value: 'rent' },
  { label: '已归档', value: 'archived', disabled: true },
];

const MATCH_OPTIONS: CheckboxGroupOption[] = [
  { label: '按分类匹配', value: 'category' },
  { label: '按关键词匹配', value: 'keyword' },
  { label: '按金额匹配', value: 'amount' },
  { label: '保留原备注', value: 'remark' },
];

const CHIP_SIZES = [
  { hint: 'small · 37.4 高', value: 'small' },
  { hint: 'normal · 44 高', value: 'normal' },
  { hint: 'large · 50.6 高', value: 'large' },
] as const;

export function CheckboxChipDemo() {
  const [selectedCategories, setSelectedCategories] = React.useState<CheckboxValue[]>([
    'food',
  ]);

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        37.4 / 44 / 50.6 高 chip，999 圆角无描边；默认 colorFillTertiary + 二级文字，选中 colorPrimaryBg + 主色 600 + 小勾
      </Text>
      <Checkbox.Group
        displayType="button"
        options={CATEGORY_OPTIONS}
        value={selectedCategories}
        onChange={setSelectedCategories}
      />
      <Text color="tertiary" size="sm">禁用 chip 用 colorFillQuaternary + 四级文字</Text>
      <Row gap="small" wrap>
        <Checkbox defaultValue displayType="button">存为模板</Checkbox>
        <Checkbox displayType="button">保存记录</Checkbox>
        <Checkbox displayType="button" disabled>已归档</Checkbox>
      </Row>
      <Text color="tertiary" size="sm">chip 三档高度</Text>
      {CHIP_SIZES.map(({ hint, value }) => (
        <Column key={value} gap="small">
          <Text color="tertiary" size="sm">{hint}</Text>
          <Row gap="small" wrap>
            <Checkbox defaultValue displayType="button" size={value}>同一张卡连续记账</Checkbox>
            <Checkbox displayType="button" size={value}>自动匹配历史分类</Checkbox>
          </Row>
        </Column>
      ))}
      <Text color="tertiary" size="sm">block 时 chip 等分宽度，一屏不超过两行</Text>
      <Checkbox.Group
        block
        defaultValue={['category', 'remark']}
        displayType="button"
        options={MATCH_OPTIONS}
      />
    </Column>
  );
}

export default CheckboxChipDemo;
