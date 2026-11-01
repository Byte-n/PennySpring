import React from 'react';
import { Column, Radio, Text } from '@pennyspring/ui';
import type {
  ComponentSize,
  RadioGroupOption,
  RadioGroupValue,
} from '@pennyspring/ui';

const RANGE_OPTIONS: RadioGroupOption[] = [
  { label: '本月', value: 'month' },
  { label: '近 3 月', value: 'quarter' },
  { label: '今年', value: 'year' },
  { label: '自定义', value: 'custom', disabled: true },
];

const DIMENSION_OPTIONS: RadioGroupOption[] = [
  { label: '按分类', value: 'category' },
  { label: '按标签', value: 'tag' },
];

interface ChipSizeSample {
  size: ComponentSize;
  hint: string;
}

const CHIP_SIZES: ChipSizeSample[] = [
  { size: 'small', hint: 'small · 37.4 高' },
  { size: 'normal', hint: 'normal · 44 高' },
  { size: 'large', hint: 'large · 50.6 高' },
];

export function RadioChipDemo() {
  const [range, setRange] = React.useState<RadioGroupValue>('month');

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        999 圆角 chip，无描边：未选 colorFillTertiary + 二级文字，选中
        colorPrimaryBg + 主色 600，禁用 colorFillQuaternary + 四级文字
      </Text>
      <Radio.Group
        displayType="button"
        options={RANGE_OPTIONS}
        value={range}
        onChange={setRange}
      />
      <Text color="tertiary" size="sm">
        当前区间：{String(range)}；一屏只放一组 chip
      </Text>
      <Text color="tertiary" size="sm">
        chip 三档高度
      </Text>
      {CHIP_SIZES.map(({ hint, size }) => (
        <Column key={size} gap="small">
          <Text color="tertiary" size="sm">
            {hint}
          </Text>
          <Radio.Group
            displayType="button"
            defaultValue="month"
            options={RANGE_OPTIONS.slice(0, 3)}
            size={size}
          />
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        block 时 chip 等分宽度，只在设了两项时使用
      </Text>
      <Radio.Group
        block
        defaultValue="category"
        displayType="button"
        options={DIMENSION_OPTIONS}
      />
    </Column>
  );
}

export default RadioChipDemo;
