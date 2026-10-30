import React from 'react';
import { Column, Radio, Text } from '@pennyspring/ui';
import type { ComponentSize, RadioGroupOption } from '@pennyspring/ui';

interface SizeSample {
  size: ComponentSize;
  hint: string;
  options: RadioGroupOption[];
}

const SIZE_SAMPLES: SizeSample[] = [
  {
    size: 'small',
    hint: 'small · 外圈 16 / 圆点 8 / 行高 37.4 · 用于筛选条与弹层内的紧凑单选',
    options: [
      { label: '本月', value: 'month' },
      { label: '近 3 月', value: 'quarter' },
    ],
  },
  {
    size: 'normal',
    hint: 'normal · 外圈 20 / 圆点 10 / 行高 44 · 默认档',
    options: [
      { label: '按分类统计', value: 'category' },
      { label: '按标签统计', value: 'tag' },
    ],
  },
  {
    size: 'large',
    hint: 'large · 外圈 24 / 圆点 12 / 行高 50.6 · 一屏最多一组',
    options: [
      { label: '导入到当前账本', value: 'current' },
      { label: '新建一个账本', value: 'new' },
    ],
  },
];

export function RadioSizeDemo() {
  return (
    <Column gap="normal">
      {SIZE_SAMPLES.map(sample => (
        <Column key={sample.size} gap="small">
          <Text color="tertiary" size="sm">{sample.hint}</Text>
          <Radio.Group
            direction="vertical"
            options={sample.options}
            defaultValue={sample.options[0].value}
            size={sample.size}
          />
        </Column>
      ))}
      <Text color="tertiary" size="sm">
        外圈 16 / 20 / 24 与圆点 10 无对应 token；8 / 12 分别取 sizeXS / paddingSM，行高 37.4 / 44 / 50.6 取 controlHeightSM / controlHeight / controlHeightLG
      </Text>
    </Column>
  );
}

export default RadioSizeDemo;
